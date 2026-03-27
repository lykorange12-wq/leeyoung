// Design Ref: §6.1 — 발행 버튼 (에디터 툴바)
'use client'

import { useState } from 'react'

interface Props {
  siteId: string
  initialPublishedAt: string | null
}

export function PublishButton({ siteId, initialPublishedAt }: Props) {
  const [publishedAt, setPublishedAt] = useState<string | null>(initialPublishedAt)
  const [loading, setLoading] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null)

  async function handlePublish() {
    setLoading(true)
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId }),
      })
      const data = await res.json() as { success?: boolean; url?: string; error?: string }
      if (!res.ok || !data.success) throw new Error(data.error ?? '발행 실패')
      setPublishedAt(new Date().toISOString())
      setPublishedUrl(data.url ?? null)
    } catch (err) {
      alert(err instanceof Error ? err.message : '발행 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {publishedUrl && (
        <a
          href={publishedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-brand-600 hover:underline"
        >
          사이트 보기 →
        </a>
      )}
      <span className={`text-xs px-2 py-1 rounded-full ${
        publishedAt ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
      }`}>
        {publishedAt ? '발행됨' : '미발행'}
      </span>
      <button
        onClick={handlePublish}
        disabled={loading}
        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? '발행 중...' : '발행하기'}
      </button>
    </div>
  )
}
