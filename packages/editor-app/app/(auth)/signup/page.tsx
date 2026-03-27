import { SignupForm } from '@/components/auth/SignupForm'

export const dynamic = 'force-dynamic'

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">무료로 시작하기</h1>
          <p className="mt-2 text-gray-600">AI가 홈페이지를 만들어 드립니다</p>
        </div>
        <SignupForm />
      </div>
    </main>
  )
}
