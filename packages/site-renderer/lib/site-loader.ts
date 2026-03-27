// Design Ref: §2 — site-renderer: Supabase에서 발행된 사이트 데이터 로드
import { createClient } from '@supabase/supabase-js'
import type { Block, BlockType, BlockPropsMap } from '@homepage-builder/shared'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface SiteData {
  id: string
  name: string
  subdomain: string
  customDomain: string | null
  publishedAt: string
  page: {
    id: string
    slug: string
    title: string
    metaDescription: string | null
  }
  blocks: Block[]
}

export async function loadSiteBySubdomain(subdomain: string): Promise<SiteData | null> {
  const { data: site } = await supabase
    .from('sites')
    .select('id, name, subdomain, custom_domain, published_at')
    .eq('subdomain', subdomain)
    .not('published_at', 'is', null)
    .single()

  if (!site) return null

  return loadSiteData(site.id)
}

export async function loadSiteByCustomDomain(domain: string): Promise<SiteData | null> {
  const { data: site } = await supabase
    .from('sites')
    .select('id, name, subdomain, custom_domain, published_at')
    .eq('custom_domain', domain)
    .not('published_at', 'is', null)
    .single()

  if (!site) return null

  return loadSiteData(site.id)
}

async function loadSiteData(siteId: string): Promise<SiteData | null> {
  const { data: site } = await supabase
    .from('sites')
    .select('id, name, subdomain, custom_domain, published_at')
    .eq('id', siteId)
    .not('published_at', 'is', null)
    .single()

  if (!site || !site.published_at) return null

  const { data: page } = await supabase
    .from('pages')
    .select('id, slug, title, meta_description')
    .eq('site_id', siteId)
    .eq('slug', '/')
    .single()

  if (!page) return null

  const { data: blockRows } = await supabase
    .from('blocks')
    .select('id, type, props, order_index')
    .eq('page_id', page.id)
    .order('order_index', { ascending: true })

  const blocks: Block[] = (blockRows ?? []).map((b) => ({
    id: b.id,
    type: b.type as BlockType,
    props: b.props as unknown as BlockPropsMap[BlockType],
    orderIndex: b.order_index,
  }))

  return {
    id: site.id,
    name: site.name,
    subdomain: site.subdomain,
    customDomain: site.custom_domain,
    publishedAt: site.published_at,
    page: {
      id: page.id,
      slug: page.slug,
      title: page.title,
      metaDescription: page.meta_description,
    },
    blocks,
  }
}
