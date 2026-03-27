// Design Ref: §3.2 — ImageBlock (이미지 표시)
'use client'

import type { ImageBlockProps } from '@homepage-builder/shared'

interface Props {
  blockId: string
  props: ImageBlockProps
  isSelected: boolean
}

const ASPECT_CLASS: Record<NonNullable<ImageBlockProps['aspectRatio']>, string> = {
  '16:9': 'aspect-video',
  '4:3':  'aspect-4/3',
  '1:1':  'aspect-square',
}

export function ImageBlock({ props, isSelected }: Props) {
  const aspectClass = ASPECT_CLASS[props.aspectRatio ?? '16:9']

  if (!props.src) {
    return (
      <div className="w-full px-8 py-4 max-w-2xl mx-auto">
        <div
          className={`w-full ${aspectClass} bg-gray-100 rounded-xl flex items-center justify-center border-2 ${
            isSelected ? 'border-brand-400 border-dashed' : 'border-gray-200'
          }`}
        >
          <div className="text-center text-gray-400">
            <p className="text-4xl mb-2">🖼️</p>
            <p className="text-sm">속성 패널에서 이미지 URL을 입력하세요</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-8 py-4 max-w-2xl mx-auto">
      <figure className="w-full">
        <div className={`w-full ${aspectClass} overflow-hidden rounded-xl`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={props.src}
            alt={props.alt}
            className="w-full h-full object-cover"
          />
        </div>
        {props.caption && (
          <figcaption className="text-sm text-gray-500 text-center mt-2">
            {props.caption}
          </figcaption>
        )}
      </figure>
    </div>
  )
}
