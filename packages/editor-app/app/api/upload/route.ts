// Design Ref: §8 — POST /api/upload (Supabase Storage 이미지 업로드)
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file 필드가 필요합니다.' }, { status: 400 })
  }

  // 보안: MIME 타입 검증
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: '허용되지 않는 파일 형식입니다. (JPEG, PNG, WebP, GIF만 가능)' },
      { status: 400 }
    )
  }

  // 보안: 파일 크기 제한 (10MB)
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: '파일 크기는 10MB 이하여야 합니다.' }, { status: 400 })
  }

  const ext = file.type.split('/')[1] ?? 'jpg'
  const path = `${user.id}/${Date.now()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    return NextResponse.json({ error: `업로드 실패: ${error.message}` }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(data.path)

  return NextResponse.json({ url: publicUrl })
}
