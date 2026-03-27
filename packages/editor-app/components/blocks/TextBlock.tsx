// Design Ref: §4.3 — 텍스트 블록 (contentEditable + DOMPurify)
'use client'

import { useRef } from 'react'
import DOMPurify from 'dompurify'
import { useEditorStore } from '@/store/editorStore'
import type { TextBlockProps } from '@homepage-builder/shared'

interface Props {
  blockId: string
  props: TextBlockProps
  isSelected: boolean
}

const ALIGNMENT_CLASS: Record<NonNullable<TextBlockProps['alignment']>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export function TextBlock({ blockId, props, isSelected }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock)
  const ref = useRef<HTMLDivElement>(null)

  const alignClass = ALIGNMENT_CLASS[props.alignment ?? 'left']

  function handleBlur() {
    if (!ref.current) return
    // 보안: DOMPurify로 XSS 방지
    const clean = DOMPurify.sanitize(ref.current.innerHTML, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: [],
    })
    updateBlock(blockId, { content: clean })
  }

  return (
    <div className="w-full px-8 py-8 max-w-2xl mx-auto">
      <div
        ref={ref}
        contentEditable={isSelected}
        suppressContentEditableWarning
        className={`prose prose-gray max-w-none outline-none focus:ring-2 focus:ring-brand-400 rounded p-1 ${alignClass} ${
          isSelected ? 'cursor-text' : ''
        }`}
        onBlur={handleBlur}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(props.content) }}
      />
    </div>
  )
}
