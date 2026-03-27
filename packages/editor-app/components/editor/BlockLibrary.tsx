// Design Ref: §4.2 — BlockLibrarySidebar (추가 가능한 블록 목록)
'use client'

import { useEditorStore } from '@/store/editorStore'
import type { BlockType } from '@homepage-builder/shared'

interface BlockEntry {
  type: BlockType
  label: string
  icon: string
  desc: string
}

const BLOCK_LIST: BlockEntry[] = [
  { type: 'header',  label: '헤더',     icon: '🎯', desc: '타이틀 + 배경 이미지' },
  { type: 'text',    label: '텍스트',   icon: '📝', desc: '본문 텍스트 영역' },
  { type: 'image',   label: '이미지',   icon: '🖼️', desc: '단일 이미지' },
  { type: 'gallery', label: '갤러리',   icon: '📸', desc: '이미지 그리드' },
  { type: 'contact', label: '연락처',   icon: '📞', desc: '전화/이메일/주소' },
  { type: 'hours',   label: '영업시간', icon: '🕐', desc: '요일별 영업시간' },
  { type: 'map',     label: '지도',     icon: '📍', desc: '카카오맵 위치' },
  { type: 'social',  label: 'SNS',      icon: '📱', desc: '소셜 미디어 링크' },
  { type: 'button',  label: '버튼',     icon: '🔘', desc: 'CTA 버튼' },
  { type: 'divider', label: '구분선',   icon: '➖', desc: '섹션 구분선' },
]

export function BlockLibrary() {
  const { addBlock, selectedBlockId } = useEditorStore((s) => ({
    addBlock: s.addBlock,
    selectedBlockId: s.selectedBlockId,
  }))

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">블록 추가</p>
        <p className="text-xs text-gray-400 mt-0.5">클릭하면 선택 블록 아래 추가됩니다</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {BLOCK_LIST.map((entry) => (
          <button
            key={entry.type}
            onClick={() => addBlock(entry.type, selectedBlockId ?? undefined)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left transition-colors group"
          >
            <span className="text-xl w-8 text-center">{entry.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800">{entry.label}</p>
              <p className="text-xs text-gray-400">{entry.desc}</p>
            </div>
            <span className="ml-auto text-gray-300 group-hover:text-brand-500 text-lg transition-colors">+</span>
          </button>
        ))}
      </div>
    </div>
  )
}
