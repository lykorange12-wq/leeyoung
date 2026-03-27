// Design Ref: §9 — 요금제 선택 페이지 (Plan SC: 전환율 5%+)
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PricingCards } from '@/components/pricing/PricingCards'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  const currentPlan = userData?.plan ?? 'free'

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">요금제 선택</h1>
          <p className="text-gray-500">업그레이드하고 더 많은 기능을 사용해보세요</p>
        </div>
        <PricingCards currentPlan={currentPlan} userId={user.id} />
      </div>
    </main>
  )
}
