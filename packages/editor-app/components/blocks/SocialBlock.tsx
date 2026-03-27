// Design Ref: §3.2 — SocialBlock (SNS 링크)
'use client'

import type { SocialBlockProps } from '@homepage-builder/shared'

interface Props {
  blockId: string
  props: SocialBlockProps
  isSelected: boolean
}

const LINKS: Array<{ key: keyof SocialBlockProps; label: string; icon: string; prefix: string }> = [
  { key: 'instagram',    label: '인스타그램', icon: '📸', prefix: 'https://instagram.com/' },
  { key: 'naverBlog',   label: '네이버 블로그', icon: '📝', prefix: 'https://blog.naver.com/' },
  { key: 'youtube',     label: '유튜브', icon: '🎬', prefix: 'https://youtube.com/@' },
  { key: 'kakaoChannel', label: '카카오채널', icon: '💬', prefix: 'https://pf.kakao.com/' },
]

export function SocialBlock({ props }: Props) {
  const active = LINKS.filter((l) => props[l.key])

  if (active.length === 0) {
    return (
      <div className="w-full px-8 py-8 max-w-2xl mx-auto text-center text-gray-400 text-sm">
        속성 패널에서 SNS 계정을 입력하세요
      </div>
    )
  }

  return (
    <div className="w-full px-8 py-8 max-w-2xl mx-auto">
      <div className="flex flex-wrap justify-center gap-4">
        {active.map(({ key, label, icon, prefix }) => (
          <a
            key={key}
            href={`${prefix}${props[key]}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
          >
            <span>{icon}</span>
            <span>{label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
