// Design Ref: §4.1 — 서버에서 받은 초기 블록 데이터로 Zustand 스토어 초기화
'use client'

import { useEffect } from 'react'
import { useEditorStore } from '@/store/editorStore'
import type { Block, BlockType, BlockPropsMap } from '@homepage-builder/shared'
import type { Database } from '@/lib/supabase/database.types'

type DbBlock = Database['public']['Tables']['blocks']['Row']

function toEditorBlock(dbBlock: DbBlock): Block {
  return {
    id: dbBlock.id,
    type: dbBlock.type as BlockType,
    props: dbBlock.props as unknown as BlockPropsMap[BlockType],
    orderIndex: dbBlock.order_index,
  }
}

interface Props {
  siteId: string
  pageId: string
  dbBlocks: DbBlock[]
}

export function EditorInitializer({ siteId, pageId, dbBlocks }: Props) {
  const initEditor = useEditorStore((s) => s.initEditor)

  useEffect(() => {
    initEditor(siteId, pageId, dbBlocks.map(toEditorBlock))
  }, [siteId, pageId, dbBlocks, initEditor])

  return null
}
