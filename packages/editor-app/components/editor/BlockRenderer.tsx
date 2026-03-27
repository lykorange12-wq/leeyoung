// Design Ref: §4.2 — BlockRenderer (블록 타입별 컴포넌트 라우팅)
'use client'

import type { Block } from '@homepage-builder/shared'
import { HeaderBlock }  from '@/components/blocks/HeaderBlock'
import { TextBlock }    from '@/components/blocks/TextBlock'
import { ImageBlock }   from '@/components/blocks/ImageBlock'
import { GalleryBlock } from '@/components/blocks/GalleryBlock'
import { MapBlock }     from '@/components/blocks/MapBlock'
import { ContactBlock } from '@/components/blocks/ContactBlock'
import { HoursBlock }   from '@/components/blocks/HoursBlock'
import { SocialBlock }  from '@/components/blocks/SocialBlock'
import { ButtonBlock }  from '@/components/blocks/ButtonBlock'
import { DividerBlock } from '@/components/blocks/DividerBlock'
import type {
  HeaderBlockProps,
  TextBlockProps,
  ImageBlockProps,
  GalleryBlockProps,
  MapBlockProps,
  ContactBlockProps,
  HoursBlockProps,
  SocialBlockProps,
  ButtonBlockProps,
  DividerBlockProps,
} from '@homepage-builder/shared'

interface Props {
  block: Block
  isSelected: boolean
}

export function BlockRenderer({ block, isSelected }: Props) {
  const common = { blockId: block.id, isSelected }

  switch (block.type) {
    case 'header':
      return <HeaderBlock  {...common} props={block.props as HeaderBlockProps}  />
    case 'text':
      return <TextBlock    {...common} props={block.props as TextBlockProps}    />
    case 'image':
      return <ImageBlock   {...common} props={block.props as ImageBlockProps}   />
    case 'gallery':
      return <GalleryBlock {...common} props={block.props as GalleryBlockProps} />
    case 'map':
      return <MapBlock     {...common} props={block.props as MapBlockProps}     />
    case 'contact':
      return <ContactBlock {...common} props={block.props as ContactBlockProps} />
    case 'hours':
      return <HoursBlock   {...common} props={block.props as HoursBlockProps}   />
    case 'social':
      return <SocialBlock  {...common} props={block.props as SocialBlockProps}  />
    case 'button':
      return <ButtonBlock  {...common} props={block.props as ButtonBlockProps}  />
    case 'divider':
      return <DividerBlock {...common} props={block.props as DividerBlockProps} />
    default:
      return (
        <div className="p-4 text-center text-gray-400 text-sm">
          알 수 없는 블록 타입: {(block as Block).type}
        </div>
      )
  }
}
