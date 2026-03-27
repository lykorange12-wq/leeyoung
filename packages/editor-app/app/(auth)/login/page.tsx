import { LoginForm } from '@/components/auth/LoginForm'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">홈페이지 빌더</h1>
          <p className="mt-2 text-gray-600">내 가게 홈페이지를 5분 만에</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
