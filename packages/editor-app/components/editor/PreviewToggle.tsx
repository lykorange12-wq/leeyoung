// Design Ref: §4.2 — PreviewToggle (데스크탑/모바일 미리보기 토글)
'use client'

import { useEditorStore } from '@/store/editorStore'

export function PreviewToggle() {
  const previewMode = useEditorStore((s) => s.previewMode)
  const setPreviewMode = useEditorStore((s) => s.setPreviewMode)

  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
      <button
        onClick={() => setPreviewMode('desktop')}
        title="데스크탑 보기"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          previewMode === 'desktop'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <DesktopIcon />
        <span className="hidden sm:inline">PC</span>
      </button>
      <button
        onClick={() => setPreviewMode('mobile')}
        title="모바일 보기"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          previewMode === 'mobile'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <MobileIcon />
        <span className="hidden sm:inline">모바일</span>
      </button>
    </div>
  )
}

function DesktopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="2" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5.5 14h5M8 11v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function MobileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="4" y="1" width="8" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="8" cy="12.5" r="0.75" fill="currentColor"/>
    </svg>
  )
}
