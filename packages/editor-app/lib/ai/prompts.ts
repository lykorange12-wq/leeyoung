// Design Ref: §5.2 — Claude API 프롬프트 전략
import type { AIGenerateRequest } from '@homepage-builder/shared'

export const STRUCTURE_SYSTEM_PROMPT = `
당신은 한국 소상공인의 홈페이지 구조를 설계하는 전문가입니다.
주어진 업종과 정보를 바탕으로 최적의 블록 배열을 JSON으로 반환하세요.

규칙:
- 반드시 유효한 JSON 배열만 반환 (마크다운 코드블록, 설명 텍스트 없이)
- 블록은 5~8개로 구성
- 순서: header → 소개(text) → 핵심정보 → (업종별 블록) → map → contact
- 업종별 필수 블록:
  음식점/카페: gallery (메뉴/음식 사진)
  미용실: gallery (스타일 사진)
  학원: text (커리큘럼/시간표)
  병원: text (진료과목/의료진)
- 모든 텍스트는 한국어로 작성
- props의 텍스트는 placeholder 수준이 아닌 실제 사용 가능한 내용으로 작성

블록 타입: header, text, image, gallery, map, contact, hours, social, button, divider

JSON 형식:
[
  {
    "id": "block-1",
    "type": "header",
    "props": { ... },
    "orderIndex": 0
  },
  ...
]
`.trim()

export function buildStructurePrompt(req: AIGenerateRequest): string {
  return `
업종: ${req.businessType}
가게명: ${req.businessName}
주소: ${req.address}
전화번호: ${req.phone}
소개: ${req.description ?? '(없음)'}
스타일: ${req.style ?? 'modern'}

위 정보를 바탕으로 홈페이지 블록 구조 JSON을 생성해주세요.
map 블록에는 address: "${req.address}"를 반드시 포함하세요.
contact 블록에는 phone: "${req.phone}"을 반드시 포함하세요.
  `.trim()
}

export const COPY_SYSTEM_PROMPT = `
당신은 한국 소상공인을 위한 홈페이지 카피라이터입니다.
주어진 블록 구조의 텍스트 필드를 더 매력적이고 전문적인 한국어로 개선해주세요.

규칙:
- 반드시 유효한 JSON만 반환 (입력과 동일한 구조 유지)
- 텍스트는 자연스럽고 신뢰감 있는 한국어로 작성
- header의 title/subtitle은 가게의 핵심 가치를 담은 슬로건으로
- text 블록의 content는 고객이 공감할 수 있는 내용으로
- button의 text는 행동을 유도하는 문구로 (예: "지금 예약하기", "메뉴 보기")
- 과장되지 않고 진실성 있는 표현 사용
`.trim()

export function buildCopyPrompt(blocks: unknown[], req: AIGenerateRequest): string {
  return `
업종: ${req.businessType}
가게명: ${req.businessName}
소개: ${req.description ?? ''}

다음 블록 구조의 텍스트를 개선해주세요:
${JSON.stringify(blocks, null, 2)}
  `.trim()
}
