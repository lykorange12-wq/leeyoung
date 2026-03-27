// Design Ref: §3.1 — Site/Page 데이터 모델

import type { Block } from './block'

export type PlanType = 'free' | 'pro' | 'business'

export interface Site {
  id: string
  userId: string
  name: string
  subdomain: string
  customDomain?: string
  plan: PlanType
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Page {
  id: string
  siteId: string
  slug: string
  title: string
  metaDescription?: string
  blocks: Block[]
  createdAt: string
}

export const PLAN_LIMITS = {
  free: {
    sites: 1,
    customDomain: false,
    removeBranding: false,
    blockTypes: 'basic' as const,
    storageGB: 0.5,
  },
  pro: {
    sites: 3,
    customDomain: true,
    removeBranding: true,
    blockTypes: 'all' as const,
    storageGB: 5,
  },
  business: {
    sites: 10,
    customDomain: true,
    removeBranding: true,
    blockTypes: 'all' as const,
    storageGB: 20,
  },
} as const satisfies Record<PlanType, unknown>
