// Design Ref: §6.2 — site-renderer: 발행된 사이트 동적 렌더링
// 커스텀 도메인: Cloudflare Worker → x-custom-domain 헤더 → loadSiteByCustomDomain
// 서브도메인: /{subdomain} 경로 → loadSiteBySubdomain
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { loadSiteBySubdomain, loadSiteByCustomDomain } from '@/lib/site-loader'
import { PublicBlockRenderer } from '@/components/blocks/PublicBlockRenderer'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug?: string[] }>
}

async function resolveSite(subdomain: string) {
  // Cloudflare Worker가 커스텀 도메인 요청 시 헤더 주입
  const headersList = await headers()
  const customDomain = headersList.get('x-custom-domain')

  if (customDomain) {
    return loadSiteByCustomDomain(customDomain)
  }
  if (subdomain) {
    return loadSiteBySubdomain(subdomain)
  }
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const subdomain = slug?.[0] ?? ''

  const site = await resolveSite(subdomain)
  if (!site) return { title: '페이지를 찾을 수 없습니다' }

  return {
    title: site.page.title,
    description: site.page.metaDescription ?? undefined,
    openGraph: { title: site.name, description: site.page.metaDescription ?? undefined },
  }
}

export default async function SitePage({ params }: Props) {
  const { slug } = await params
  const subdomain = slug?.[0] ?? ''

  const headersList = await headers()
  const customDomain = headersList.get('x-custom-domain')

  if (!subdomain && !customDomain) {
    // 루트 접근 시 소개 페이지 (개발용)
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-xl font-bold mb-2">Site Renderer</p>
          <p className="text-sm">/{'{subdomain}'} 경로로 접근하세요</p>
        </div>
      </main>
    )
  }

  const site = await resolveSite(subdomain)
  if (!site) notFound()

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto">
        {site.blocks.map((block) => (
          <PublicBlockRenderer key={block.id} block={block} />
        ))}
      </div>

      {/* 무료 플랜 브랜딩 워터마크 (Plan SC: 전환율 달성용) */}
      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100 mt-8">
        <a href="https://homepage-builder.kr" className="hover:text-gray-600 transition-colors">
          홈페이지빌더로 제작됨
        </a>
      </footer>
    </main>
  )
}
