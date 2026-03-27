// Design Ref: §3.2 — GalleryBlock (이미지 갤러리)
'use client'

import type { GalleryBlockProps } from '@homepage-builder/shared'

interface Props {
  blockId: string
  props: GalleryBlockProps
  isSelected: boolean
}

export function GalleryBlock({ props }: Props) {
  const cols = props.columns ?? 3
  const gridClass = cols === 2 ? 'grid-cols-2' : cols === 4 ? 'grid-cols-4' : 'grid-cols-3'

  if (props.images.length === 0) {
    return (
      <div className="w-full px-8 py-8 max-w-2xl mx-auto">
        <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
          <p className="text-sm text-gray-400">속성 패널에서 이미지를 추가하세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-8 py-8 max-w-2xl mx-auto">
      <div className={`grid ${gridClass} gap-3`}>
        {props.images.map((img, i) => (
          <div key={i} className="aspect-square overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  )
}
