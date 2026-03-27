// Design Ref: §3.2 — ButtonBlock (CTA 버튼)
'use client'

import type { ButtonBlockProps } from '@homepage-builder/shared'

interface Props {
  blockId: string
  props: ButtonBlockProps
  isSelected: boolean
}

const STYLE_CLASS: Record<NonNullable<ButtonBlockProps['style']>, string> = {
  primary:   'bg-brand-600 hover:bg-brand-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  outline:   'border-2 border-brand-600 text-brand-600 hover:bg-brand-50',
}

export function ButtonBlock({ props }: Props) {
  return (
    <div className="w-full px-8 py-6 max-w-2xl mx-auto flex justify-center">
      <a
        href={props.url}
        className={`inline-block px-8 py-3 rounded-full font-semibold transition-colors ${
          STYLE_CLASS[props.style ?? 'primary']
        }`}
      >
        {props.text}
      </a>
    </div>
  )
}
