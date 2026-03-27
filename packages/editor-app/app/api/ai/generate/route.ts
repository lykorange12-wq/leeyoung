// Design Ref: §8 — POST /api/ai/generate
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateSiteBlocks } from '@/lib/ai/generate'
import type { AIGenerateRequest } from '@homepage-builder/shared'
import type { Json } from '@/lib/supabase/database.types'

const requestSchema = z.object({
  businessType: z.enum(['음식점', '카페', '미용실', '학원', '병원/의원', '소매점', '기타']),
  businessName: z.string().min(1).max(50),
  address: z.string().min(1).max(200),
  phone: z.string().min(1).max(20),
  description: z.string().max(500).optional(),
  style: z.enum(['modern', 'warm', 'professional']).optional(),
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
    return NextResponse.json({ error: '입력값이 올바르지 않습니다.', details: parsed.error.flatten() }, { status: 400 })
  }

  const req: AIGenerateRequest = parsed.data

  try {
    // 플랜 제한 확인 (무료: 사이트 1개)
    const { data: user_data } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .single()

    const { count } = await supabase
      .from('sites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const planLimits = { free: 1, pro: 3, business: 10 } as const
    const plan = (user_data?.plan ?? 'free') as keyof typeof planLimits
    const limit = planLimits[plan]

    if ((count ?? 0) >= limit) {
      return NextResponse.json(
        { error: `현재 플랜(${plan})에서는 최대 ${limit}개의 사이트만 만들 수 있습니다.` },
        { status: 403 }
      )
    }

    // AI 블록 생성 (Plan SC: AI 생성 성공률 ≥ 95%)
    const blocks = await generateSiteBlocks(req)

    // 서브도메인 생성 (가게명 기반)
    const baseSubdomain = req.businessName
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '')
      .substring(0, 20) || 'site'
    const subdomain = `${baseSubdomain}-${Date.now().toString(36)}`

    // Supabase에 Site + Page + Blocks 저장
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .insert({ user_id: user.id, name: req.businessName, subdomain })
      .select()
      .single()

    if (siteError || !site) {
      throw new Error(`사이트 생성 실패: ${siteError?.message}`)
    }

    const { data: page, error: pageError } = await supabase
      .from('pages')
      .insert({ site_id: site.id, slug: '/', title: req.businessName })
      .select()
      .single()

    if (pageError || !page) {
      throw new Error(`페이지 생성 실패: ${pageError?.message}`)
    }

    const blockRows = blocks.map((b) => ({
      page_id: page.id,
      type: b.type,
      props: b.props as unknown as Json,
      order_index: b.orderIndex,
    }))

    const { error: blocksError } = await supabase.from('blocks').insert(blockRows)
    if (blocksError) throw new Error(`블록 저장 실패: ${blocksError.message}`)

    return NextResponse.json({ siteId: site.id, pageId: page.id, blocksCreated: blocks.length })
  } catch (error) {
    console.error('AI 생성 오류:', error)
    return NextResponse.json(
      { error: 'AI 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
