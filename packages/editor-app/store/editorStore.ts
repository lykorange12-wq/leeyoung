// Design Ref: §4.1 — Zustand + Immer 에디터 상태 관리
'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Block, BlockType, BlockPropsMap } from '@homepage-builder/shared'
import { generateId } from '@homepage-builder/shared'
import { createClient } from '@/lib/supabase/client'
import type { Json } from '@/lib/supabase/database.types'

const DEFAULT_PROPS: Record<BlockType, BlockPropsMap[BlockType]> = {
  header:  { title: '새 헤더', subtitle: '', ctaText: '' },
  text:    { content: '<p>텍스트를 입력하세요.</p>' },
  image:   { src: '', alt: '이미지' },
  gallery: { images: [], columns: 3 },
  map:     { address: '' },
  contact: { phone: '', email: '', address: '' },
  hours:   { schedule: [
    { day: '월-금', open: '09:00', close: '18:00' },
    { day: '토', open: '10:00', close: '16:00' },
    { day: '일', open: '00:00', close: '00:00', closed: true },
  ]},
  social:  { instagram: '', naverBlog: '', youtube: '', kakaoChannel: '' },
  button:  { text: '자세히 보기', url: '#', style: 'primary' },
  divider: { style: 'solid' },
}

interface EditorStore {
  siteId: string
  pageId: string
  blocks: Block[]
  selectedBlockId: string | null
  previewMode: 'desktop' | 'mobile'
  isDirty: boolean
  isSaving: boolean

  initEditor: (siteId: string, pageId: string, blocks: Block[]) => void
  selectBlock: (blockId: string | null) => void
  updateBlock: <T extends BlockType>(blockId: string, props: Partial<BlockPropsMap[T]>) => void
  addBlock: (type: BlockType, afterBlockId?: string) => void
  removeBlock: (blockId: string) => void
  reorderBlocks: (newOrder: string[]) => void
  setPreviewMode: (mode: 'desktop' | 'mobile') => void
  save: () => Promise<void>
}

export const useEditorStore = create<EditorStore>()(
  immer((set, get) => ({
    siteId: '',
    pageId: '',
    blocks: [],
    selectedBlockId: null,
    previewMode: 'desktop',
    isDirty: false,
    isSaving: false,

    initEditor: (siteId, pageId, blocks) => {
      set((state) => {
        state.siteId = siteId
        state.pageId = pageId
        state.blocks = blocks
        state.selectedBlockId = null
        state.isDirty = false
      })
    },

    selectBlock: (blockId) => {
      set((state) => {
        state.selectedBlockId = blockId
      })
    },

    updateBlock: (blockId, props) => {
      set((state) => {
        const block = state.blocks.find((b) => b.id === blockId)
        if (!block) return
        // Plan SC: 불변성 원칙 — Immer가 내부적으로 새 객체 생성
        Object.assign(block.props, props)
        state.isDirty = true
      })
    },

    addBlock: (type, afterBlockId) => {
      set((state) => {
        const newBlock: Block = {
          id: generateId(),
          type,
          props: DEFAULT_PROPS[type] as BlockPropsMap[typeof type],
          orderIndex: 0,
        }

        if (afterBlockId) {
          const idx = state.blocks.findIndex((b) => b.id === afterBlockId)
          state.blocks.splice(idx + 1, 0, newBlock)
        } else {
          state.blocks.push(newBlock)
        }

        // orderIndex 재계산
        state.blocks.forEach((b, i) => { b.orderIndex = i })
        state.selectedBlockId = newBlock.id
        state.isDirty = true
      })
    },

    removeBlock: (blockId) => {
      set((state) => {
        state.blocks = state.blocks.filter((b) => b.id !== blockId)
        state.blocks.forEach((b, i) => { b.orderIndex = i })
        if (state.selectedBlockId === blockId) state.selectedBlockId = null
        state.isDirty = true
      })
    },

    setPreviewMode: (mode) => {
      set((state) => { state.previewMode = mode })
    },

    reorderBlocks: (newOrder) => {
      set((state) => {
        const blockMap = new Map(state.blocks.map((b) => [b.id, b]))
        const reordered = newOrder.map((id, i) => {
          const b = blockMap.get(id)
          if (!b) return null
          b.orderIndex = i
          return b
        }).filter((b): b is Block => b !== null)
        state.blocks = reordered
        state.isDirty = true
      })
    },

    save: async () => {
      const { pageId, blocks, isSaving } = get()
      if (isSaving) return

      set((state) => { state.isSaving = true })

      try {
        const supabase = createClient()

        // 현재 블록을 모두 upsert
        const rows = blocks.map((b) => ({
          id: b.id,
          page_id: pageId,
          type: b.type,
          props: b.props as unknown as Json,
          order_index: b.orderIndex,
        }))

        const { error: upsertError } = await supabase
          .from('blocks')
          .upsert(rows, { onConflict: 'id' })

        if (upsertError) throw new Error(`저장 실패: ${upsertError.message}`)

        // 삭제된 블록 제거 (DB에 있지만 스토어에 없는 것)
        const currentIds = blocks.map((b) => b.id)
        if (currentIds.length > 0) {
          await supabase
            .from('blocks')
            .delete()
            .eq('page_id', pageId)
            .not('id', 'in', `(${currentIds.join(',')})`)
        } else {
          await supabase.from('blocks').delete().eq('page_id', pageId)
        }

        set((state) => {
          state.isDirty = false
          state.isSaving = false
        })
      } catch (error) {
        set((state) => { state.isSaving = false })
        throw error
      }
    },
  }))
)
