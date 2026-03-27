// Design Ref: §3.2 — HeaderBlock 렌더러 (인라인 편집 지원)
'use client'

import { useEditorStore } from '@/store/editorStore'
import type { HeaderBlockProps } from '@homepage-builder/shared'

interface Props {
  blockId: string
  props: HeaderBlockProps
  isSelected: boolean
}

export function HeaderBlock({ blockId, props, isSelected }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  const bgStyle = props.backgroundImage
    ? { backgroundImage: `url(${props.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: props.backgroundColor ?? '#1a1a2e' }

  return (
    <section
      className="relative w-full min-h-[320px] flex flex-col items-center justify-center text-center px-8 py-16"
      style={bgStyle}
    >
      {props.backgroundImage && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      <div className="relative z-10 w-full max-w-2xl">
        <h1
          contentEditable={isSelected}
          suppressContentEditableWarning
          className="text-3xl md:text-5xl font-bold text-white mb-4 outline-none focus:ring-2 focus:ring-brand-400 rounded"
          onBlur={(e) => updateBlock(blockId, { title: e.currentTarget.textContent ?? '' })}
        >
          {props.title}
        </h1>
        {(props.subtitle !== undefined || isSelected) && (
          <p
            contentEditable={isSelected}
            suppressContentEditableWarning
            className="text-lg text-white/80 mb-8 outline-none focus:ring-2 focus:ring-brand-400 rounded"
            onBlur={(e) => updateBlock(blockId, { subtitle: e.currentTarget.textContent ?? '' })}
          >
            {props.subtitle ?? ''}
          </p>
        )}
        {props.ctaText && (
          <a
            href={props.ctaUrl ?? '#'}
            className="inline-block px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-full transition-colors"
          >
            {props.ctaText}
          </a>
        )}
      </div>
    </section>
  )
}
