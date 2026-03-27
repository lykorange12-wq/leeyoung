// Design Ref: §4.2 — 에디터 페이지 (서버 컴포넌트: 초기 데이터 로드)
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import type { Database } from '@/lib/supabase/database.types'
import { EditorCanvas }      from '@/components/editor/EditorCanvas'
import { BlockLibrary }      from '@/components/editor/BlockLibrary'
import { PropertyPanel }     from '@/components/editor/PropertyPanel'
import { EditorInitializer } from '@/components/editor/EditorInitializer'
import { SaveButton }        from '@/components/editor/SaveButton'
import { PublishButton }     from '@/components/editor/PublishButton'
import { PreviewToggle }     from '@/components/editor/PreviewToggle'

type Site  = Database['public']['Tables']['sites']['Row']
type DbBlock = Database['public']['Tables']['blocks']['Row']

interface Props {
  params: Promise<{ siteId: string }>
}

export default async function EditorPage({ params }: Props) {
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

  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('site_id', siteId)
    .eq('slug', '/')
    .single()

  const { data: dbBlocks } = await supabase
    .from('blocks')
    .select('*')
    .eq('page_id', page?.id ?? '')
    .order('order_index', { ascending: true })

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col">
      {/* 상단 툴바 */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← 대시보드</a>
          <span className="text-sm font-medium text-gray-900">{(site as Site).name}</span>
        </div>
        <div className="flex items-center gap-3">
          <PreviewToggle />
          <span className={`text-xs px-2 py-1 rounded-full ${
            (site as Site).published_at ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {(site as Site).published_at ? '발행됨' : '미발행'}
          </span>
          <SaveButton />
          <PublishButton
            siteId={siteId}
            initialPublishedAt={(site as Site).published_at}
          />
        </div>
      </header>

      {/* 에디터 본체 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 블록 라이브러리 (좌측) */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-hidden flex flex-col">
          <BlockLibrary />
        </aside>

        {/* 캔버스 (중앙) */}
        <EditorCanvas />

        {/* 속성 패널 (우측) */}
        <aside className="w-72 bg-white border-l border-gray-200 overflow-hidden flex flex-col">
          <PropertyPanel />
        </aside>
      </div>

      {/* Zustand 스토어 초기화 (클라이언트) */}
      <EditorInitializer
        siteId={siteId}
        pageId={page?.id ?? ''}
        dbBlocks={(dbBlocks ?? []) as DbBlock[]}
      />
    </main>
  )
}
