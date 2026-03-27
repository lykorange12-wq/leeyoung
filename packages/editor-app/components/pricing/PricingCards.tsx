// Design Ref: §9 — 요금제 카드 UI (Plan SC: 전환율 5%+ 유도)
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PlanType } from '@homepage-builder/shared'

interface Plan {
  type: PlanType
  name: string
  price: number | null
  desc: string
  features: string[]
  cta: string
  highlight?: boolean
}

const PLANS: Plan[] = [
  {
    type: 'free',
    name: '무료',
    price: 0,
    desc: '시작하기에 딱',
    features: [
      '홈페이지 1개',
      '기본 블록 10종',
      '저장공간 0.5GB',
      '홈페이지빌더 워터마크',
    ],
    cta: '현재 플랜',
  },
  {
    type: 'pro',
    name: 'Pro',
    price: 9900,
    desc: '개인 사업자에게 최적',
    features: [
      '홈페이지 3개',
      '모든 블록 20종',
      '저장공간 5GB',
      '커스텀 도메인 연결',
      '워터마크 제거',
    ],
    cta: '시작하기',
    highlight: true,
  },
  {
    type: 'business',
    name: 'Business',
    price: 19900,
    desc: '여러 매장·브랜드 운영',
    features: [
      '홈페이지 10개',
      '모든 블록 20종',
      '저장공간 20GB',
      '커스텀 도메인 연결',
      '워터마크 제거',
      '우선 고객 지원',
    ],
    cta: '시작하기',
  },
]

interface Props {
  currentPlan: PlanType
  userId: string
}

export function PricingCards({ currentPlan }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<PlanType | null>(null)

  async function handleUpgrade(plan: Exclude<PlanType, 'free'>) {
    setLoading(plan)
    try {
      const origin = window.location.origin
      const res = await fetch('/api/payments/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          successUrl: `${origin}/pricing?success=1&plan=${plan}`,
          failUrl: `${origin}/pricing?fail=1`,
        }),
      })

      const data = await res.json() as { checkoutUrl?: string; error?: string }

      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error ?? '결제 페이지 로드 실패')
      }

      // 토스 결제 페이지로 리다이렉트
      window.location.href = data.checkoutUrl
    } catch (err) {
      alert(err instanceof Error ? err.message : '오류가 발생했습니다.')
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {PLANS.map((plan) => {
        const isCurrent = plan.type === currentPlan
        const isUpgrade = plan.price !== null && plan.price > 0 && !isCurrent

        return (
          <div
            key={plan.type}
            className={`relative bg-white rounded-2xl border-2 p-8 flex flex-col ${
              plan.highlight
                ? 'border-brand-500 shadow-lg shadow-brand-100'
                : 'border-gray-200'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  인기
                </span>
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm font-medium text-gray-500 mb-1">{plan.name}</p>
              <div className="flex items-baseline gap-1">
                {plan.price === 0 ? (
                  <span className="text-4xl font-bold text-gray-900">무료</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price?.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm">원/월</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{plan.desc}</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-brand-500 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => isUpgrade && handleUpgrade(plan.type as Exclude<PlanType, 'free'>)}
              disabled={isCurrent || loading !== null}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                isCurrent
                  ? 'bg-gray-100 text-gray-400 cursor-default'
                  : plan.highlight
                  ? 'bg-brand-600 hover:bg-brand-700 text-white'
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
              } disabled:opacity-50`}
            >
              {loading === plan.type ? '처리 중...' : isCurrent ? '현재 플랜' : plan.cta}
            </button>
          </div>
        )
      })}
    </div>
  )
}
