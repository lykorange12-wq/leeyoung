// Design Ref: §3.2 — Block 타입 스키마 (Canvas/JSON 기반 에디터의 핵심 데이터 구조)

export type BlockType =
  | 'header'
  | 'text'
  | 'image'
  | 'gallery'
  | 'map'
  | 'contact'
  | 'hours'
  | 'social'
  | 'button'
  | 'divider'

export interface HeaderBlockProps {
  title: string
  subtitle?: string
  backgroundImage?: string
  backgroundColor?: string
  ctaText?: string
  ctaUrl?: string
}

export interface TextBlockProps {
  content: string
  alignment?: 'left' | 'center' | 'right'
}

export interface ImageBlockProps {
  src: string
  alt: string
  caption?: string
  aspectRatio?: '16:9' | '4:3' | '1:1'
}

export interface GalleryBlockProps {
  images: Array<{ src: string; alt: string }>
  columns?: 2 | 3 | 4
}

export interface MapBlockProps {
  address: string
  lat?: number
  lng?: number
  kakaoPlaceId?: string
}

export interface ContactBlockProps {
  phone?: string
  email?: string
  address?: string
  showForm?: boolean
}

export interface HoursBlockProps {
  schedule: Array<{
    day: string
    open: string
    close: string
    closed?: boolean
  }>
}

export interface SocialBlockProps {
  instagram?: string
  naverBlog?: string
  youtube?: string
  kakaoChannel?: string
}

export interface ButtonBlockProps {
  text: string
  url: string
  style?: 'primary' | 'secondary' | 'outline'
}

export interface DividerBlockProps {
  style?: 'solid' | 'dashed' | 'dots'
}

export type BlockPropsMap = {
  header: HeaderBlockProps
  text: TextBlockProps
  image: ImageBlockProps
  gallery: GalleryBlockProps
  map: MapBlockProps
  contact: ContactBlockProps
  hours: HoursBlockProps
  social: SocialBlockProps
  button: ButtonBlockProps
  divider: DividerBlockProps
}

export interface Block<T extends BlockType = BlockType> {
  id: string
  type: T
  props: BlockPropsMap[T]
  orderIndex: number
}
