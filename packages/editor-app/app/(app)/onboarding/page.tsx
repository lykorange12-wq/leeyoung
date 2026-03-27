import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">홈페이지 만들기</h1>
          <p className="mt-2 text-gray-500 text-sm">정보를 입력하면 AI가 30초 안에 홈페이지 초안을 만들어 드립니다</p>
        </div>
        <OnboardingWizard />
      </div>
    </main>
  )
}
