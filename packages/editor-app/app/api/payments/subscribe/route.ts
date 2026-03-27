// Design Ref: §9 — POST /api/payments/subscribe (토스페이먼츠 빌링 키 발급 요청)
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { PlanType } from '@homepage-builder/shared'

const PLAN_PRICES: Record<Exclude<PlanType, 'free'>, number> = {
  pro:      9900,
  business: 19900,
}

const requestSchema = z.object({
  plan: z.enum(['pro', 'business']),
  successUrl: z.string().url(),
  failUrl: z.string().url(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: '요청 데이터가 올바르지 않습니다.' }, { status: 400 })
  }

  const { plan, successUrl, failUrl } = parsed.data
  const secretKey = process.env.TOSS_SECRET_KEY

  if (!secretKey) {
    return NextResponse.json({ error: '결제 설정이 올바르지 않습니다.' }, { status: 500 })
  }

  const amount = PLAN_PRICES[plan]
  const orderId = `order_${user.id}_${Date.now()}`
  const customerKey = `customer_${user.id}`

  // 토스페이먼츠 빌링 인증 요청
  // 실제 카드 정보는 토스 SDK가 처리 (보안: 서버에 카드번호 전달 없음)
  const tossResponse = await fetch(
    'https://api.tosspayments.com/v1/billing/authorizations/card',
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerKey,
        successUrl,
        failUrl,
      }),
    }
  )

  if (!tossResponse.ok) {
    const err = await tossResponse.json() as { message?: string }
    return NextResponse.json(
      { error: `결제 요청 실패: ${err.message ?? '알 수 없는 오류'}` },
      { status: 500 }
    )
  }

  const tossData = await tossResponse.json() as { checkout?: { url?: string } }
  const checkoutUrl = tossData.checkout?.url

  if (!checkoutUrl) {
    return NextResponse.json({ error: '결제 URL 생성 실패' }, { status: 500 })
  }

  // 임시 주문 정보 저장 (웹훅 수신 시 매칭용)
  await supabase.from('subscriptions').upsert({
    user_id: user.id,
    plan,
    status: 'past_due' as const,  // 결제 완료 전 임시 상태
  }, { onConflict: 'user_id' })

  return NextResponse.json({
    checkoutUrl,
    orderId,
    amount,
    plan,
  })
}
