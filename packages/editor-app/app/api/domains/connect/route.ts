// Design Ref: §6.2, M10 — POST /api/domains/connect (커스텀 도메인 등록)
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { PlanType } from '@homepage-builder/shared'
import { PLAN_LIMITS } from '@homepage-builder/shared'

const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i

const requestSchema = z.object({
  siteId: z.string().uuid(),
  domain: z.string().regex(DOMAIN_RE, '올바른 도메인 형식이 아닙니다.').max(253),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  let body: unknown
  try { body = await request.json() }
  catch { return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 }) }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? '입력값 오류' }, { status: 400 })
  }

  const { siteId, domain } = parsed.data

  // 플랜 확인 (Pro 이상만 커스텀 도메인 허용)
  const { data: userData } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = (userData?.plan ?? 'free') as PlanType
  if (!PLAN_LIMITS[plan].customDomain) {
    return NextResponse.json(
      { error: 'Pro 이상 플랜에서만 커스텀 도메인을 사용할 수 있습니다.' },
      { status: 403 }
    )
  }

  // 소유권 확인
  const { data: site } = await supabase
    .from('sites')
    .select('id')
    .eq('id', siteId)
    .eq('user_id', user.id)
    .single()

  if (!site) return NextResponse.json({ error: '사이트를 찾을 수 없습니다.' }, { status: 404 })

  // 도메인 중복 확인
  const { data: existing } = await supabase
    .from('sites')
    .select('id')
    .eq('custom_domain', domain)
    .neq('id', siteId)
    .single()

  if (existing) {
    return NextResponse.json({ error: '이미 사용 중인 도메인입니다.' }, { status: 409 })
  }

  // 도메인 저장 (DNS 검증 전 pending 상태)
  const { error } = await supabase
    .from('sites')
    .update({ custom_domain: domain })
    .eq('id', siteId)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: `저장 실패: ${error.message}` }, { status: 500 })

  // DNS 검증용 TXT 레코드 값 생성
  const { createHash } = await import('crypto')
  const verificationToken = createHash('sha256')
    .update(`${siteId}-${domain}-${process.env.DOMAIN_VERIFICATION_SECRET ?? 'dev'}`)
    .digest('hex')
    .slice(0, 32)

  return NextResponse.json({
    success: true,
    domain,
    verification: {
      type: 'TXT',
      name: `_homepage-builder.${domain}`,
      value: `homepage-builder-verify=${verificationToken}`,
    },
  })
}
