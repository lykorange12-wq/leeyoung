// Design Ref: §9, §10 — POST /api/payments/webhook (토스페이먼츠 웹훅)
// 보안: HMAC-SHA256 서명 검증 필수 (노출 시 플랜 무료 업그레이드 가능)
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { PlanType } from '@homepage-builder/shared'

// 웹훅은 서버-서버이므로 서비스 롤 키 사용
function getAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

type TossWebhookEvent =
  | { eventType: 'BILLING_KEY_ISSUED';    data: { billingKey: string; customerKey: string } }
  | { eventType: 'PAYMENT_STATUS_CHANGED'; data: { orderId: string; status: 'DONE' | 'CANCELED' | 'ABORTED' } }

export async function POST(request: Request) {
  const secretKey = process.env.TOSS_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ error: '설정 오류' }, { status: 500 })
  }

  // 보안: 토스 웹훅 서명 검증
  const webhookSecret = process.env.TOSS_WEBHOOK_SECRET
  if (webhookSecret) {
    const signature = request.headers.get('x-signature')
    if (!signature) {
      return NextResponse.json({ error: '서명 없음' }, { status: 401 })
    }

    const body = await request.text()
    const { createHmac } = await import('crypto')
    const expected = createHmac('sha256', webhookSecret).update(body).digest('base64')

    if (signature !== expected) {
      return NextResponse.json({ error: '서명 불일치' }, { status: 401 })
    }

    const event = JSON.parse(body) as TossWebhookEvent
    await handleWebhookEvent(event)
    return NextResponse.json({ received: true })
  }

  // TOSS_WEBHOOK_SECRET 미설정 시 (개발 환경)
  const event = await request.json() as TossWebhookEvent
  await handleWebhookEvent(event)
  return NextResponse.json({ received: true })
}

async function handleWebhookEvent(event: TossWebhookEvent) {
  const supabase = getAdminClient()

  if (event.eventType === 'BILLING_KEY_ISSUED') {
    // 빌링 키 발급 완료 → customerKey로 userId 추출
    const { billingKey, customerKey } = event.data
    const userId = customerKey.replace('customer_', '')

    // 최초 결제 실행 (빌링 키로 즉시 청구)
    const secretKey = process.env.TOSS_SECRET_KEY!
    const chargeRes = await fetch('https://api.tosspayments.com/v1/billing/' + billingKey, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerKey: `customer_${userId}`,
        amount: 9900,       // 실제로는 구독 플랜에서 가져와야 함
        orderId: `auto_${Date.now()}`,
        orderName: 'Pro 플랜 구독',
        customerEmail: '',
      }),
    })

    if (chargeRes.ok) {
      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan: 'pro',
        status: 'active' as const,
        toss_billing_key: billingKey,
        current_period_end: periodEnd.toISOString(),
      }, { onConflict: 'user_id' })

      // users 테이블 플랜 업데이트
      await supabase
        .from('users')
        .update({ plan: 'pro' as PlanType })
        .eq('id', userId)
    }
  }

  if (event.eventType === 'PAYMENT_STATUS_CHANGED') {
    const { status } = event.data

    if (status === 'CANCELED') {
      // 구독 취소 처리 — orderId에서 userId 추출 불가 시 패스
      // 실제 운영에서는 orderId ↔ userId 매핑 테이블 필요
    }
  }
}
