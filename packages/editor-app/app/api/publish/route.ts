// Design Ref: §6.1 — POST /api/publish (사이트 발행)
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const requestSchema = z.object({
  siteId: z.string().uuid(),
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
    return NextResponse.json({ error: '사이트 ID가 필요합니다.' }, { status: 400 })
  }

  const { siteId } = parsed.data

  // 소유권 확인
  const { data: site } = await supabase
    .from('sites')
    .select('id, subdomain')
    .eq('id', siteId)
    .eq('user_id', user.id)
    .single()

  if (!site) {
    return NextResponse.json({ error: '사이트를 찾을 수 없습니다.' }, { status: 404 })
  }

  // published_at 업데이트
  const { error } = await supabase
    .from('sites')
    .update({ published_at: new Date().toISOString() })
    .eq('id', siteId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: `발행 실패: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    subdomain: site.subdomain,
    // Plan SC: 발행 후 접근 가능한 URL 반환
    url: `https://${site.subdomain}.${process.env.NEXT_PUBLIC_SITE_DOMAIN ?? 'example.com'}`,
  })
}
