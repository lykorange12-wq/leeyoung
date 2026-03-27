// Design Ref: §5.1 — AI 생성 요청/응답 타입

export type BusinessType =
  | '음식점'
  | '카페'
  | '미용실'
  | '학원'
  | '병원/의원'
  | '소매점'
  | '기타'

export type SiteStyle = 'modern' | 'warm' | 'professional'

export interface AIGenerateRequest {
  businessType: BusinessType
  businessName: string
  address: string
  phone: string
  description?: string | undefined
  style?: SiteStyle | undefined
}

export interface AIGenerateResponse {
  siteId: string
  pageId: string
  blocksCreated: number
}
