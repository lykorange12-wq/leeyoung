export const runtime = 'edge'

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '홈페이지',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
