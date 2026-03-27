// Design Ref: §6.2, M10 — 커스텀 도메인 패널 (연결 + TXT 검증 UI)
'use client'

import { useState } from 'react'
import type { PlanType } from '@homepage-builder/shared'

interface Props {
  siteId: string
  currentDomain: string | null
  currentPlan: string
}

interface VerificationInfo {
  type: 'TXT'
  name: string
  value: string
}

type Step = 'idle' | 'entered' | 'pending' | 'verified'

export function CustomDomainPanel({ siteId, currentDomain, currentPlan }: Props) {
  const isPro = (currentPlan as PlanType) === 'pro' || (currentPlan as PlanType) === 'business'

  const [domain, setDomain] = useState(currentDomain ?? '')
  const [step, setStep] = useState<Step>(currentDomain ? 'pending' : 'idle')
  const [verification, setVerification] = useState<VerificationInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verifiedDomain, setVerifiedDomain] = useState<string | null>(null)

  if (!isPro) {
    return (
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 text-center space-y-3">
        <p className="text-sm text-gray-600">
          커스텀 도메인 연결은 <strong>Pro 이상 플랜</strong>에서 사용할 수 있습니다.
        </p>
        <a
          href="/pricing"
          className="inline-block px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          플랜 업그레이드
        </a>
      </div>
    )
  }

  async function handleConnect() {
    if (!domain.trim()) return
    setError(null)
    setIsConnecting(true)
    try {
      const res = await fetch('/api/domains/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, domain: domain.trim() }),
      })
      const data = await res.json() as {
        success?: boolean
        domain?: string
        verification?: VerificationInfo
        error?: string
      }
      if (!res.ok || !data.success) {
        setError(data.error ?? '도메인 연결에 실패했습니다.')
        return
      }
      setVerification(data.verification ?? null)
      setStep('pending')
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setIsConnecting(false)
    }
  }

  async function handleVerify() {
    setError(null)
    setIsVerifying(true)
    try {
      const res = await fetch(`/api/domains/verify?siteId=${siteId}`)
      const data = await res.json() as {
        verified?: boolean
        domain?: string
        expected?: string
        found?: string[]
        error?: string
      }
      if (data.verified) {
        setVerifiedDomain(data.domain ?? domain)
        setStep('verified')
      } else {
        setError(
          data.error ??
            `TXT 레코드가 아직 전파되지 않았습니다. 최대 72시간이 소요될 수 있습니다.`
        )
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setIsVerifying(false)
    }
  }

  function handleReset() {
    setDomain('')
    setStep('idle')
    setVerification(null)
    setError(null)
    setVerifiedDomain(null)
  }

  if (step === 'verified') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <span className="text-green-600 text-xl">✓</span>
          <div>
            <p className="text-sm font-semibold text-green-800">도메인 연결 완료</p>
            <p className="text-sm text-green-700 mt-0.5">{verifiedDomain}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          DNS 설정이 완전히 전파되면 사이트가 해당 도메인에서 접근 가능합니다.
        </p>
        <button
          onClick={handleReset}
          className="text-sm text-gray-500 underline hover:text-gray-700"
        >
          다른 도메인으로 변경
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step 1: 도메인 입력 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          도메인 주소
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value)
              setStep('idle')
              setError(null)
            }}
            placeholder="example.com"
            disabled={step === 'pending'}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            onClick={handleConnect}
            disabled={isConnecting || !domain.trim() || step === 'pending'}
            className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            {isConnecting ? '처리 중...' : '연결하기'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          www 없이 루트 도메인을 입력하세요 (예: mybusiness.com)
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step 2: DNS TXT 레코드 안내 */}
      {step === 'pending' && verification && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
            <p className="text-sm font-semibold text-blue-800">
              DNS 설정이 필요합니다
            </p>
            <p className="text-sm text-blue-700">
              도메인 DNS 관리 페이지에서 아래 TXT 레코드를 추가하세요:
            </p>

            <div className="space-y-2">
              <DnsRow label="레코드 타입" value={verification.type} />
              <DnsRow label="호스트 이름" value={verification.name} copyable />
              <DnsRow label="값" value={verification.value} copyable />
            </div>

            <p className="text-xs text-blue-600 mt-2">
              DNS 변경사항이 전파되는 데 최대 72시간이 소요될 수 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {isVerifying ? '검증 중...' : 'DNS 검증하기'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm rounded-xl transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DnsRow({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    void navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-blue-600 font-medium w-24 shrink-0 pt-0.5">{label}</span>
      <code className="text-xs bg-white border border-blue-200 px-2 py-1 rounded font-mono break-all flex-1">
        {value}
      </code>
      {copyable && (
        <button
          onClick={handleCopy}
          className="text-xs text-blue-600 hover:text-blue-800 shrink-0 pt-0.5"
        >
          {copied ? '복사됨' : '복사'}
        </button>
      )}
    </div>
  )
}
