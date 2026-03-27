// Design Ref: §3.2 — DividerBlock (구분선)
'use client'

import type { DividerBlockProps } from '@homepage-builder/shared'

interface Props {
  blockId: string
  props: DividerBlockProps
  isSelected: boolean
}

const BORDER_CLASS: Record<NonNullable<DividerBlockProps['style']>, string> = {
  solid:  'border-solid',
  dashed: 'border-dashed',
  dots:   'border-dotted',
}

export function DividerBlock({ props }: Props) {
  return (
    <div className="w-full px-8 py-4 max-w-2xl mx-auto">
      <hr className={`border-t-2 border-gray-200 ${BORDER_CLASS[props.style ?? 'solid']}`} />
    </div>
  )
}
