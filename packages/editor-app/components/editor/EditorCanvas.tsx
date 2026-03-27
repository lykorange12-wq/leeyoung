// Design Ref: §4.2 — EditorCanvas (@dnd-kit/sortable 기반 드래그앤드롭)
'use client'

import { useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEditorStore } from '@/store/editorStore'
import { BlockRenderer } from './BlockRenderer'
import type { Block } from '@homepage-builder/shared'

// 개별 정렬 가능한 블록 래퍼
function SortableBlock({ block }: { block: Block }) {
  const { selectedBlockId, selectBlock } = useEditorStore((s) => ({
    selectedBlockId: s.selectedBlockId,
    selectBlock: s.selectBlock,
  }))

  const isSelected = block.id === selectedBlockId

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => selectBlock(block.id)}
      className={`relative group ${
        isSelected
          ? 'ring-2 ring-brand-500 ring-offset-2 rounded-lg'
          : 'hover:ring-1 hover:ring-gray-300 hover:ring-offset-1 rounded-lg'
      }`}
    >
      {/* 드래그 핸들 (좌측) */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 z-10"
      >
        <div className="flex flex-col gap-0.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-0.5">
              <div className="w-1 h-1 rounded-full bg-gray-400" />
              <div className="w-1 h-1 rounded-full bg-gray-400" />
            </div>
          ))}
        </div>
      </div>

      {/* 블록 타입 레이블 (선택 시) */}
      {isSelected && (
        <div className="absolute top-0 left-0 -translate-y-6 z-10">
          <span className="text-xs bg-brand-500 text-white px-2 py-0.5 rounded-t-md">
            {block.type}
          </span>
        </div>
      )}

      <BlockRenderer block={block} isSelected={isSelected} />
    </div>
  )
}

// 메인 EditorCanvas
export function EditorCanvas() {
  const { blocks, reorderBlocks, previewMode } = useEditorStore((s) => ({
    blocks: s.blocks,
    reorderBlocks: s.reorderBlocks,
    previewMode: s.previewMode,
  }))

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // 8px 이동 후 드래그 시작
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = blocks.findIndex((b) => b.id === active.id)
      const newIndex = blocks.findIndex((b) => b.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      const newOrder = arrayMove(blocks, oldIndex, newIndex).map((b) => b.id)
      reorderBlocks(newOrder)
    },
    [blocks, reorderBlocks]
  )

  // 모바일 모드: 375px 고정 너비로 폰 프레임 시뮬레이션
  const canvasMaxWidth = previewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-2xl'

  if (blocks.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
        <div className="text-center text-gray-400 max-w-xs">
          <p className="text-5xl mb-4">🧱</p>
          <p className="text-base font-medium mb-2">블록을 추가해보세요</p>
          <p className="text-sm">좌측 패널에서 원하는 블록을 클릭하면 추가됩니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className={`${canvasMaxWidth} mx-auto bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300`}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y divide-gray-100">
              {blocks.map((block) => (
                <SortableBlock key={block.id} block={block} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
