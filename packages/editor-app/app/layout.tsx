import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '홈페이지 빌더 — 내 가게 홈페이지를 5분 만에',
  description: 'AI가 만들어주는 소상공인 전용 홈페이지 빌더',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
