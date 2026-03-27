'use client'

// Design Ref: §5.1 — 온보딩 → AI 생성 플로우 (3단계 위저드)
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BusinessType, SiteStyle } from '@homepage-builder/shared'

type Step = 1 | 2 | 3

interface FormData {
  businessType: BusinessType | ''
  businessName: string
  phone: string
  address: string
  description: string
  style: SiteStyle
}

const BUSINESS_TYPES: BusinessType[] = ['음식점', '카페', '미용실', '학원', '병원/의원', '소매점', '기타']

const BUSINESS_ICONS: Record<BusinessType, string> = {
  '음식점': '🍽️', '카페': '☕', '미용실': '✂️',
  '학원': '📚', '병원/의원': '🏥', '소매점': '🛍️', '기타': '🏪',
}

const STYLES: Array<{ value: SiteStyle; label: string; desc: string }> = [
  { value: 'modern', label: '모던', desc: '깔끔하고 세련된 느낌' },
  { value: 'warm', label: '따뜻한', desc: '친근하고 포근한 느낌' },
  { value: 'professional', label: '전문적', desc: '신뢰감 있는 비즈니스 느낌' },
]

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>({
    businessType: '',
    businessName: '',
    phone: '',
    address: '',
    description: '',
    style: 'modern',
  })

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function canNext(): boolean {
    if (step === 1) return form.businessType !== ''
    if (step === 2) return form.businessName.trim() !== '' && form.phone.trim() !== '' && form.address.trim() !== ''
    return true
  }

  async function handleGenerate() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType: form.businessType,
          businessName: form.businessName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          description: form.description.trim() || undefined,
          style: form.style,
        }),
      })

      const data = await res.json() as { siteId?: string; error?: string }

      if (!res.ok || !data.siteId) {
        throw new Error(data.error ?? 'AI 생성에 실패했습니다.')
      }

      // Plan SC: 온보딩 완료 후 에디터로 바로 이동
      router.push(`/editor/${data.siteId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-lg">
      {/* 진행 바 */}
      <div className="flex gap-2 mb-8">
        {([1, 2, 3] as Step[]).map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-brand-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step 1: 업종 선택 */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">어떤 가게인가요?</h2>
          <p className="text-sm text-gray-500 mb-6">업종에 맞는 홈페이지를 AI가 자동으로 만들어 드립니다</p>
          <div className="grid grid-cols-2 gap-3">
            {BUSINESS_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => update('businessType', type)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                  form.businessType === type
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{BUSINESS_ICONS[type]}</span>
                <span className="font-medium text-gray-900">{type}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: 기본 정보 */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">가게 정보를 입력해 주세요</h2>
          <p className="text-sm text-gray-500 mb-6">AI가 이 정보를 바탕으로 홈페이지를 만들어 드립니다</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가게 이름 *</label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => update('businessName', e.target.value)}
                placeholder="예: 맛있는 돈까스"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">전화번호 *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="예: 02-1234-5678"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">주소 *</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="예: 서울 마포구 합정동 123-45"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                가게 소개 <span className="text-gray-400">(선택)</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="특별한 점이나 강조하고 싶은 내용을 자유롭게 적어주세요"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: 스타일 선택 + 생성 */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">어떤 스타일로 만들까요?</h2>
          <p className="text-sm text-gray-500 mb-6">홈페이지 전체 분위기를 선택해 주세요</p>
          <div className="space-y-3 mb-6">
            {STYLES.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => update('style', value)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-colors ${
                  form.style === value
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="font-medium text-gray-900">{label}</div>
                  <div className="text-sm text-gray-500">{desc}</div>
                </div>
                {form.style === value && (
                  <span className="text-brand-500 text-xl">✓</span>
                )}
              </button>
            ))}
          </div>

          {/* 생성 정보 요약 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-600">
            <p>📍 <strong>{form.businessName}</strong> ({form.businessType})</p>
            <p className="mt-1">📞 {form.phone}</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 mb-4">{error}</p>
          )}

          {loading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-brand-600">
                <span className="animate-spin text-xl">⚙️</span>
                <span className="text-sm font-medium">AI가 홈페이지를 만들고 있어요... (최대 30초)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 버튼 영역 */}
      <div className="flex gap-3 mt-6">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => (s - 1) as Step)}
            disabled={loading}
            className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            이전
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={() => setStep((s) => (s + 1) as Step)}
            disabled={!canNext()}
            className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors disabled:opacity-40"
          >
            다음
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? '생성 중...' : 'AI로 홈페이지 만들기'}
          </button>
        )}
      </div>
    </div>
  )
}
