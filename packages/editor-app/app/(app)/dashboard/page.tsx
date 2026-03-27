import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'
import { redirect } from 'next/navigation'
import Link from 'next/link'

type Site = Database['public']['Tables']['sites']['Row']

const PLAN_LABEL: Record<string, string> = {
  free:     '무료 플랜',
  pro:      'Pro 플랜',
  business: 'Business 플랜',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: sites }, { data: userData }] = await Promise.all([
    supabase.from('sites').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
    supabase.from('users').select('plan').eq('id', user.id).single(),
  ])

  const plan = userData?.plan ?? 'free'
  const siteDomain = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? 'example.com'

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">내 홈페이지</h1>
          <div className="flex items-center gap-3">
            {/* 플랜 배지 */}
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              plan === 'free'
                ? 'bg-gray-100 text-gray-600'
                : 'bg-brand-100 text-brand-700'
            }`}>
              {PLAN_LABEL[plan] ?? plan}
            </span>
            {/* 업그레이드 버튼 (무료 플랜만) */}
            {plan === 'free' && (
              <Link
                href="/pricing"
                className="text-xs font-semibold px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
              >
                업그레이드
              </Link>
            )}
            <span className="text-sm text-gray-500">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="text-sm text-gray-500 hover:text-gray-700">로그아웃</button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 새 홈페이지 만들기 */}
          <Link
            href="/onboarding"
            className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-2xl hover:border-brand-500 hover:bg-brand-50 transition-colors group"
          >
            <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">+</span>
            <span className="text-sm font-medium text-gray-600 group-hover:text-brand-600">
              새 홈페이지 만들기
            </span>
          </Link>

          {/* 기존 사이트 목록 */}
          {(sites as Site[] | null)?.map((site) => (
            <div
              key={site.id}
              className="flex flex-col justify-between h-48 bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div>
                <h2 className="font-semibold text-gray-900">{site.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {site.custom_domain ?? `${site.subdomain}.${siteDomain}`}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  site.published_at
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {site.published_at ? '발행됨' : '미발행'}
                </span>
                <div className="flex items-center gap-2">
                  {/* 설정 링크 */}
                  <Link
                    href={`/settings/${site.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="사이트 설정"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M13.3 6.7l-.9-.5a5.4 5.4 0 000-2.4l.9-.5a.8.8 0 00.3-1.1L12.4.9a.8.8 0 00-1.1-.3l-.9.5A5.4 5.4 0 008 .5 5.4 5.4 0 005.6 1l-.9-.5a.8.8 0 00-1.1.3L2.4 2.2a.8.8 0 00.3 1.1l.9.5a5.4 5.4 0 000 2.4l-.9.5a.8.8 0 00-.3 1.1l1.2 2a.8.8 0 001.1.3l.9-.5c.7.4 1.5.6 2.4.6s1.7-.2 2.4-.6l.9.5a.8.8 0 001.1-.3l1.2-2a.8.8 0 00-.3-1.1z" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                  </Link>
                  <Link
                    href={`/editor/${site.id}`}
                    className="text-sm text-brand-600 font-medium hover:text-brand-700"
                  >
                    편집하기 →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!sites || sites.length === 0) && (
          <div className="text-center mt-16">
            <p className="text-gray-500 mb-4">아직 만든 홈페이지가 없습니다.</p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              AI로 홈페이지 만들기
            </Link>
          </div>
        )}

        {/* 요금제 안내 (무료 플랜) */}
        {plan === 'free' && sites && sites.length > 0 && (
          <div className="mt-8 p-4 bg-brand-50 border border-brand-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-900">Pro 플랜으로 업그레이드하세요</p>
              <p className="text-xs text-brand-700 mt-0.5">커스텀 도메인 연결, 워터마크 제거, 홈페이지 3개까지</p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 text-sm font-semibold px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors"
            >
              월 9,900원 →
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
