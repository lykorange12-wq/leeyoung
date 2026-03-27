// Design Ref: §4.1 — 저장 버튼 (isDirty 상태 반영)
'use client'

import { useState } from 'react'
import { useEditorStore } from '@/store/editorStore'

export function SaveButton() {
  const { isDirty, isSaving, save } = useEditorStore((s) => ({
    isDirty: s.isDirty,
    isSaving: s.isSaving,
    save: s.save,
  }))
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setError(null)
    try {
      await save()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패')
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <button
        onClick={handleSave}
        disabled={!isDirty || isSaving}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          isDirty && !isSaving
            ? 'bg-gray-800 hover:bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isSaving ? '저장 중...' : isDirty ? '저장하기' : '저장됨'}
      </button>
    </div>
  )
}
