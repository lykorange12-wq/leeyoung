// Design Ref: §6.2, M10 — 사이트 설정 페이지 (커스텀 도메인)
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { CustomDomainPanel } from '@/components/settings/CustomDomainPanel'
import type { Database } from '@/lib/supabase/database.types'

type Site = Database['public']['Tables']['sites']['Row']

interface Props {
  params: Promise<{ siteId: string }>
}

export default async function SiteSettingsPage({ params }: Props) {
  const { siteId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: site } = await supabase
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .eq('user_id', user.id)
    .single()

  if (!site) notFound()

  const { data: userData } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = userData?.plan ?? 'free'

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <a href={`/editor/${siteId}`} className="text-sm text-gray-500 hover:text-gray-700">
            ← 에디터로 돌아가기
          </a>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{(site as Site).name} 설정</h1>
          <p className="text-sm text-gray-500 mt-1">사이트 설정을 관리합니다</p>
        </div>

        {/* 커스텀 도메인 패널 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">커스텀 도메인</h2>
          <p className="text-sm text-gray-500 mb-6">
            내 도메인을 연결하여 전문적인 URL로 사이트를 운영하세요
          </p>
          <CustomDomainPanel
            siteId={siteId}
            currentDomain={(site as Site).custom_domain}
            currentPlan={plan}
          />
        </div>
      </div>
    </main>
  )
}
