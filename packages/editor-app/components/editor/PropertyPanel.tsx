// Design Ref: §4.2 — PropertyPanel (선택된 블록의 속성 편집)
'use client'

import { useEditorStore } from '@/store/editorStore'
import type {
  BlockType,
  HeaderBlockProps,
  TextBlockProps,
  ImageBlockProps,
  MapBlockProps,
  ContactBlockProps,
  HoursBlockProps,
  SocialBlockProps,
  ButtonBlockProps,
  DividerBlockProps,
} from '@homepage-builder/shared'

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
    </div>
  )
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (v: T) => void
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// --- 블록 타입별 패널 ---

function HeaderPanel({ blockId, props }: { blockId: string; props: HeaderBlockProps }) {
  const update = useEditorStore((s) => s.updateBlock<'header'>)
  const u = (p: Partial<HeaderBlockProps>) => update(blockId, p)

  return (
    <div className="space-y-4">
      <InputField label="제목" value={props.title} onChange={(v) => u({ title: v })} placeholder="헤더 제목" />
      <InputField label="부제목" value={props.subtitle ?? ''} onChange={(v) => u({ subtitle: v })} placeholder="부제목 (선택)" />
      <InputField label="배경 이미지 URL" value={props.backgroundImage ?? ''} onChange={(v) => u({ backgroundImage: v })} placeholder="https://..." />
      <InputField label="배경색" value={props.backgroundColor ?? '#1a1a2e'} type="color" onChange={(v) => u({ backgroundColor: v })} />
      <InputField label="버튼 텍스트" value={props.ctaText ?? ''} onChange={(v) => u({ ctaText: v })} placeholder="자세히 보기" />
      <InputField label="버튼 링크" value={props.ctaUrl ?? ''} onChange={(v) => u({ ctaUrl: v })} placeholder="#" />
    </div>
  )
}

function TextPanel({ blockId, props }: { blockId: string; props: TextBlockProps }) {
  const update = useEditorStore((s) => s.updateBlock<'text'>)

  return (
    <div className="space-y-4">
      <SelectField
        label="정렬"
        value={props.alignment ?? 'left'}
        options={[
          { value: 'left', label: '왼쪽' },
          { value: 'center', label: '가운데' },
          { value: 'right', label: '오른쪽' },
        ]}
        onChange={(v) => update(blockId, { alignment: v })}
      />
      <p className="text-xs text-gray-500">텍스트 내용은 캔버스에서 직접 클릭하여 편집하세요.</p>
    </div>
  )
}

function ImagePanel({ blockId, props }: { blockId: string; props: ImageBlockProps }) {
  const update = useEditorStore((s) => s.updateBlock<'image'>)
  const u = (p: Partial<ImageBlockProps>) => update(blockId, p)

  return (
    <div className="space-y-4">
      <InputField label="이미지 URL" value={props.src} onChange={(v) => u({ src: v })} placeholder="https://..." />
      <InputField label="대체 텍스트" value={props.alt} onChange={(v) => u({ alt: v })} placeholder="이미지 설명" />
      <InputField label="캡션" value={props.caption ?? ''} onChange={(v) => u({ caption: v })} placeholder="이미지 설명 (선택)" />
      <SelectField
        label="비율"
        value={props.aspectRatio ?? '16:9'}
        options={[
          { value: '16:9', label: '16:9 (가로)' },
          { value: '4:3',  label: '4:3 (표준)' },
          { value: '1:1',  label: '1:1 (정사각)' },
        ]}
        onChange={(v) => u({ aspectRatio: v })}
      />
    </div>
  )
}

function ContactPanel({ blockId, props }: { blockId: string; props: ContactBlockProps }) {
  const update = useEditorStore((s) => s.updateBlock<'contact'>)
  const u = (p: Partial<ContactBlockProps>) => update(blockId, p)

  return (
    <div className="space-y-4">
      <InputField label="전화번호" value={props.phone ?? ''} onChange={(v) => u({ phone: v })} placeholder="02-1234-5678" />
      <InputField label="이메일" value={props.email ?? ''} onChange={(v) => u({ email: v })} placeholder="info@example.com" />
      <InputField label="주소" value={props.address ?? ''} onChange={(v) => u({ address: v })} placeholder="서울 마포구..." />
    </div>
  )
}

function HoursPanel({ blockId, props }: { blockId: string; props: HoursBlockProps }) {
  const update = useEditorStore((s) => s.updateBlock<'hours'>)

  return (
    <div className="space-y-3">
      {props.schedule.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
          <InputField
            label="요일"
            value={item.day}
            onChange={(v) => {
              const next = props.schedule.map((s, idx) => idx === i ? { ...s, day: v } : s)
              update(blockId, { schedule: next })
            }}
          />
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="오픈"
              value={item.open}
              type="time"
              onChange={(v) => {
                const next = props.schedule.map((s, idx) => idx === i ? { ...s, open: v } : s)
                update(blockId, { schedule: next })
              }}
            />
            <InputField
              label="마감"
              value={item.close}
              type="time"
              onChange={(v) => {
                const next = props.schedule.map((s, idx) => idx === i ? { ...s, close: v } : s)
                update(blockId, { schedule: next })
              }}
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={item.closed ?? false}
              onChange={(e) => {
                const next = props.schedule.map((s, idx) => idx === i ? { ...s, closed: e.target.checked } : s)
                update(blockId, { schedule: next })
              }}
            />
            휴무일
          </label>
        </div>
      ))}
    </div>
  )
}

function SocialPanel({ blockId, props }: { blockId: string; props: SocialBlockProps }) {
  const update = useEditorStore((s) => s.updateBlock<'social'>)
  const u = (p: Partial<SocialBlockProps>) => update(blockId, p)

  return (
    <div className="space-y-4">
      <InputField label="인스타그램 ID" value={props.instagram ?? ''} onChange={(v) => u({ instagram: v })} placeholder="instagram_id" />
      <InputField label="네이버 블로그 ID" value={props.naverBlog ?? ''} onChange={(v) => u({ naverBlog: v })} placeholder="blog_id" />
      <InputField label="유튜브 채널" value={props.youtube ?? ''} onChange={(v) => u({ youtube: v })} placeholder="@channel" />
      <InputField label="카카오채널 ID" value={props.kakaoChannel ?? ''} onChange={(v) => u({ kakaoChannel: v })} placeholder="_xxxxxID" />
    </div>
  )
}

function MapPanel({ blockId, props }: { blockId: string; props: MapBlockProps }) {
  const update = useEditorStore((s) => s.updateBlock<'map'>)
  return (
    <div className="space-y-4">
      <InputField label="주소" value={props.address} onChange={(v) => update(blockId, { address: v })} placeholder="서울 마포구 합정동 123-45" />
      <p className="text-xs text-gray-500">주소 입력 후 지도가 자동으로 업데이트됩니다.</p>
    </div>
  )
}

function ButtonPanel({ blockId, props }: { blockId: string; props: ButtonBlockProps }) {
  const update = useEditorStore((s) => s.updateBlock<'button'>)
  const u = (p: Partial<ButtonBlockProps>) => update(blockId, p)

  return (
    <div className="space-y-4">
      <InputField label="버튼 텍스트" value={props.text} onChange={(v) => u({ text: v })} />
      <InputField label="링크 URL" value={props.url} onChange={(v) => u({ url: v })} placeholder="https://..." />
      <SelectField
        label="스타일"
        value={props.style ?? 'primary'}
        options={[
          { value: 'primary',   label: '주요 (파란색)' },
          { value: 'secondary', label: '보조 (회색)' },
          { value: 'outline',   label: '아웃라인' },
        ]}
        onChange={(v) => u({ style: v })}
      />
    </div>
  )
}

function DividerPanel({ blockId, props }: { blockId: string; props: DividerBlockProps }) {
  const update = useEditorStore((s) => s.updateBlock<'divider'>)

  return (
    <SelectField
      label="선 스타일"
      value={props.style ?? 'solid'}
      options={[
        { value: 'solid',  label: '실선' },
        { value: 'dashed', label: '점선' },
        { value: 'dots',   label: '점점선' },
      ]}
      onChange={(v) => update(blockId, { style: v })}
    />
  )
}

// --- 메인 PropertyPanel ---

const BLOCK_LABELS: Record<BlockType, string> = {
  header:  '헤더',
  text:    '텍스트',
  image:   '이미지',
  gallery: '갤러리',
  map:     '지도',
  contact: '연락처',
  hours:   '영업시간',
  social:  'SNS',
  button:  '버튼',
  divider: '구분선',
}

export function PropertyPanel() {
  const { blocks, selectedBlockId, removeBlock } = useEditorStore((s) => ({
    blocks: s.blocks,
    selectedBlockId: s.selectedBlockId,
    removeBlock: s.removeBlock,
  }))

  const selected = selectedBlockId
    ? blocks.find((b) => b.id === selectedBlockId)
    : null

  if (!selected) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
        <p className="text-4xl mb-3">👆</p>
        <p className="text-sm font-medium">블록을 선택하면</p>
        <p className="text-sm">속성을 편집할 수 있습니다</p>
      </div>
    )
  }

  const renderPanel = () => {
    switch (selected.type) {
      case 'header':  return <HeaderPanel  blockId={selected.id} props={selected.props as HeaderBlockProps}  />
      case 'text':    return <TextPanel    blockId={selected.id} props={selected.props as TextBlockProps}    />
      case 'image':   return <ImagePanel   blockId={selected.id} props={selected.props as ImageBlockProps}   />
      case 'map':     return <MapPanel     blockId={selected.id} props={selected.props as MapBlockProps}     />
      case 'contact': return <ContactPanel blockId={selected.id} props={selected.props as ContactBlockProps} />
      case 'hours':   return <HoursPanel   blockId={selected.id} props={selected.props as HoursBlockProps}   />
      case 'social':  return <SocialPanel  blockId={selected.id} props={selected.props as SocialBlockProps}  />
      case 'button':  return <ButtonPanel  blockId={selected.id} props={selected.props as ButtonBlockProps}  />
      case 'divider': return <DividerPanel blockId={selected.id} props={selected.props as DividerBlockProps} />
      default: return <p className="text-sm text-gray-500">이 블록은 편집할 속성이 없습니다.</p>
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">속성</p>
          <p className="text-sm font-semibold text-gray-800">{BLOCK_LABELS[selected.type]}</p>
        </div>
        <button
          onClick={() => removeBlock(selected.id)}
          className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
        >
          삭제
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {renderPanel()}
      </div>
    </div>
  )
}
