// Design Ref: §3.2 — HoursBlock (영업시간)
'use client'

import type { HoursBlockProps } from '@homepage-builder/shared'

interface Props {
  blockId: string
  props: HoursBlockProps
  isSelected: boolean
}

export function HoursBlock({ props }: Props) {
  return (
    <div className="w-full px-8 py-10 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">영업시간</h2>
      <div className="space-y-3">
        {props.schedule.map((item, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
            <span className="font-medium text-gray-800">{item.day}</span>
            {item.closed ? (
              <span className="text-red-500 text-sm">휴무</span>
            ) : (
              <span className="text-gray-600">{item.open} – {item.close}</span>
            )}
          </div>
        ))}
        {props.schedule.length === 0 && (
          <p className="text-gray-400 text-center text-sm">속성 패널에서 영업시간을 입력하세요</p>
        )}
      </div>
    </div>
  )
}
