// Design Ref: §6.2, M10 — GET /api/domains/verify (DNS TXT 레코드 검증)
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const siteId = searchParams.get('siteId')

  if (!siteId) {
    return NextResponse.json({ error: 'siteId가 필요합니다.' }, { status: 400 })
  }

  // 소유권 + 커스텀 도메인 확인
  const { data: site } = await supabase
    .from('sites')
    .select('id, custom_domain')
    .eq('id', siteId)
    .eq('user_id', user.id)
    .single()

  if (!site) return NextResponse.json({ error: '사이트를 찾을 수 없습니다.' }, { status: 404 })
  if (!site.custom_domain) return NextResponse.json({ error: '등록된 커스텀 도메인이 없습니다.' }, { status: 400 })

  const domain = site.custom_domain
  const expectedToken = createHash('sha256')
    .update(`${siteId}-${domain}-${process.env.DOMAIN_VERIFICATION_SECRET ?? 'dev'}`)
    .digest('hex')
    .slice(0, 32)

  const expectedValue = `homepage-builder-verify=${expectedToken}`

  // DNS TXT 레코드 조회 (Node.js dns 모듈)
  try {
    const { resolveTxt } = await import('dns/promises')
    const txtRecords = await resolveTxt(`_homepage-builder.${domain}`)
    const flat = txtRecords.flat()

    const verified = flat.some((r) => r === expectedValue)

    if (!verified) {
      return NextResponse.json({
        verified: false,
        expected: expectedValue,
        found: flat,
      })
    }

    return NextResponse.json({ verified: true, domain })
  } catch {
    return NextResponse.json({
      verified: false,
      error: `DNS 조회 실패. TXT 레코드가 전파되지 않았을 수 있습니다. (최대 72시간 소요)`,
    })
  }
}
