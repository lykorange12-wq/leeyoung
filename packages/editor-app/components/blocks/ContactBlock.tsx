// Design Ref: §3.2 — ContactBlock (연락처 정보)
'use client'

import type { ContactBlockProps } from '@homepage-builder/shared'

interface Props {
  blockId: string
  props: ContactBlockProps
  isSelected: boolean
}

export function ContactBlock({ props }: Props) {
  return (
    <div className="w-full px-8 py-10 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">연락처</h2>
      <div className="space-y-4">
        {props.phone && (
          <div className="flex items-center gap-3 text-gray-700">
            <span className="text-xl">📞</span>
            <a href={`tel:${props.phone}`} className="hover:text-brand-600 transition-colors">
              {props.phone}
            </a>
          </div>
        )}
        {props.email && (
          <div className="flex items-center gap-3 text-gray-700">
            <span className="text-xl">✉️</span>
            <a href={`mailto:${props.email}`} className="hover:text-brand-600 transition-colors">
              {props.email}
            </a>
          </div>
        )}
        {props.address && (
          <div className="flex items-start gap-3 text-gray-700">
            <span className="text-xl mt-0.5">📍</span>
            <span>{props.address}</span>
          </div>
        )}
        {!props.phone && !props.email && !props.address && (
          <p className="text-gray-400 text-center text-sm">속성 패널에서 연락처를 입력하세요</p>
        )}
      </div>
    </div>
  )
}
