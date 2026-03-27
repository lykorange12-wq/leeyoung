// Design Ref: §5.1 — AI 생성 플로우: Claude(구조) → GPT-4o(카피) → Unsplash(이미지)
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { AIGenerateRequest, Block } from '@homepage-builder/shared'
import {
  STRUCTURE_SYSTEM_PROMPT,
  buildStructurePrompt,
  COPY_SYSTEM_PROMPT,
  buildCopyPrompt,
} from './prompts'

/** Step 1: Claude로 블록 구조 JSON 생성 */
async function generateStructure(req: AIGenerateRequest): Promise<Block[]> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: STRUCTURE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildStructurePrompt(req) }],
  })

  const text = message.content[0]?.type === 'text' ? message.content[0].text : ''

  try {
    const parsed = JSON.parse(text) as Block[]
    return parsed
  } catch {
    throw new Error(`Claude 구조 생성 파싱 실패: ${text.substring(0, 200)}`)
  }
}

/** Step 2: GPT-4o로 카피라이팅 개선 */
async function improveCopy(blocks: Block[], req: AIGenerateRequest): Promise<Block[]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: COPY_SYSTEM_PROMPT },
      {
        role: 'user',
        content: buildCopyPrompt(blocks, req),
      },
    ],
    max_tokens: 2000,
  })

  const text = response.choices[0]?.message?.content ?? ''

  try {
    const parsed = JSON.parse(text) as { blocks?: Block[] } | Block[]
    // GPT-4o는 json_object 모드라 {"blocks": [...]} 형태로 반환할 수 있음
    if (Array.isArray(parsed)) return parsed
    if ('blocks' in parsed && Array.isArray(parsed.blocks)) return parsed.blocks
    return blocks // 파싱 실패 시 원본 반환
  } catch {
    return blocks // 카피 개선 실패 시 원본 구조 사용
  }
}

/** Step 3: Unsplash에서 업종별 히어로 이미지 선택 */
async function fetchHeroImage(businessType: string): Promise<string | null> {
  const query = encodeURIComponent(`${businessType} korea interior`)
  const res = await fetch(
    `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape`,
    {
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
    }
  )

  if (!res.ok) return null

  const data = await res.json() as { urls?: { regular?: string } }
  return data.urls?.regular ?? null
}

/** 전체 AI 생성 파이프라인 (Claude + GPT-4o + Unsplash) */
export async function generateSiteBlocks(req: AIGenerateRequest): Promise<Block[]> {
  // Step 1: 구조 생성 (Claude)
  const structure = await generateStructure(req)

  // Step 2: 카피 개선 (GPT-4o) — 병렬 실행 가능하지 않으므로 순차 실행
  const improved = await improveCopy(structure, req)

  // Step 3: 히어로 이미지 추가 (Unsplash) — header 블록에 배경이미지 설정
  const heroImage = await fetchHeroImage(req.businessType)
  if (heroImage) {
    const headerBlock = improved.find((b) => b.type === 'header')
    if (headerBlock && 'backgroundImage' in headerBlock.props) {
      // 불변성 유지: 새 객체 생성
      const idx = improved.indexOf(headerBlock)
      return improved.map((b, i) =>
        i === idx
          ? { ...b, props: { ...b.props, backgroundImage: heroImage } }
          : b
      )
    }
  }

  return improved
}
