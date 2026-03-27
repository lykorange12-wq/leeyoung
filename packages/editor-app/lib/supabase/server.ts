// Design Ref: §7 — 서버 컴포넌트 / API Routes용 Supabase 클라이언트
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              if (options) {
                cookieStore.set({ name, value, ...options })
              } else {
                cookieStore.set(name, value)
              }
            })
          } catch {
            // Server Component에서는 set이 불가. 미들웨어가 처리함.
          }
        },
      },
    }
  )
}
