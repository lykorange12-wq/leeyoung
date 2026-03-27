// Design Ref: §2 — 발행된 사이트용 읽기 전용 블록 렌더러
import type { Block } from '@homepage-builder/shared'
import type {
  HeaderBlockProps,
  TextBlockProps,
  ImageBlockProps,
  GalleryBlockProps,
  MapBlockProps,
  ContactBlockProps,
  HoursBlockProps,
  SocialBlockProps,
  ButtonBlockProps,
  DividerBlockProps,
} from '@homepage-builder/shared'

function HeaderBlock({ props }: { props: HeaderBlockProps }) {
  const bgStyle = props.backgroundImage
    ? { backgroundImage: `url(${props.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: props.backgroundColor ?? '#1a1a2e' }

  return (
    <section className="relative w-full min-h-[320px] flex flex-col items-center justify-center text-center px-8 py-16" style={bgStyle}>
      {props.backgroundImage && <div className="absolute inset-0 bg-black/40" />}
      <div className="relative z-10 w-full max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{props.title}</h1>
        {props.subtitle && <p className="text-lg text-white/80 mb-8">{props.subtitle}</p>}
        {props.ctaText && (
          <a href={props.ctaUrl ?? '#'} className="inline-block px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition-colors">
            {props.ctaText}
          </a>
        )}
      </div>
    </section>
  )
}

function TextBlock({ props }: { props: TextBlockProps }) {
  const alignClass = props.alignment === 'center' ? 'text-center' : props.alignment === 'right' ? 'text-right' : 'text-left'
  return (
    <div className="w-full px-8 py-8 max-w-2xl mx-auto">
      <div
        className={`prose prose-gray max-w-none ${alignClass}`}
        dangerouslySetInnerHTML={{ __html: props.content }}
      />
    </div>
  )
}

function ImageBlock({ props }: { props: ImageBlockProps }) {
  if (!props.src) return null
  return (
    <div className="w-full px-8 py-4 max-w-2xl mx-auto">
      <figure>
        <div className="w-full aspect-video overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={props.src} alt={props.alt} className="w-full h-full object-cover" />
        </div>
        {props.caption && <figcaption className="text-sm text-gray-500 text-center mt-2">{props.caption}</figcaption>}
      </figure>
    </div>
  )
}

function ContactBlock({ props }: { props: ContactBlockProps }) {
  return (
    <div className="w-full px-8 py-10 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">연락처</h2>
      <div className="space-y-4">
        {props.phone && <div className="flex items-center gap-3 text-gray-700"><span>📞</span><a href={`tel:${props.phone}`}>{props.phone}</a></div>}
        {props.email && <div className="flex items-center gap-3 text-gray-700"><span>✉️</span><a href={`mailto:${props.email}`}>{props.email}</a></div>}
        {props.address && <div className="flex items-start gap-3 text-gray-700"><span>📍</span><span>{props.address}</span></div>}
      </div>
    </div>
  )
}

function HoursBlock({ props }: { props: HoursBlockProps }) {
  return (
    <div className="w-full px-8 py-10 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">영업시간</h2>
      <div className="space-y-3">
        {props.schedule.map((item, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
            <span className="font-medium text-gray-800">{item.day}</span>
            {item.closed ? <span className="text-red-500 text-sm">휴무</span> : <span className="text-gray-600">{item.open} – {item.close}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function MapBlock({ props }: { props: MapBlockProps }) {
  if (!props.address) return null
  const encoded = encodeURIComponent(props.address)
  return (
    <div className="w-full px-8 py-8 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">오시는 길</h2>
      <p className="text-center text-gray-600 mb-3">📍 {props.address}</p>
      <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
        <iframe
          src={`https://map.kakao.com/link/search/${encoded}`}
          className="w-full h-full border-0"
          title="카카오맵"
          loading="lazy"
        />
      </div>
    </div>
  )
}

function SocialBlock({ props }: { props: SocialBlockProps }) {
  const links = [
    props.instagram    && { label: '인스타그램', icon: '📸', href: `https://instagram.com/${props.instagram}` },
    props.naverBlog    && { label: '네이버 블로그', icon: '📝', href: `https://blog.naver.com/${props.naverBlog}` },
    props.youtube      && { label: '유튜브', icon: '🎬', href: `https://youtube.com/@${props.youtube}` },
    props.kakaoChannel && { label: '카카오채널', icon: '💬', href: `https://pf.kakao.com/${props.kakaoChannel}` },
  ].filter(Boolean) as Array<{ label: string; icon: string; href: string }>

  if (links.length === 0) return null

  return (
    <div className="w-full px-8 py-8 max-w-2xl mx-auto flex flex-wrap justify-center gap-4">
      {links.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors">
          <span>{l.icon}</span><span>{l.label}</span>
        </a>
      ))}
    </div>
  )
}

function ButtonBlock({ props }: { props: ButtonBlockProps }) {
  const cls = props.style === 'secondary'
    ? 'bg-gray-200 hover:bg-gray-300 text-gray-800'
    : props.style === 'outline'
    ? 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
    : 'bg-blue-600 hover:bg-blue-700 text-white'

  return (
    <div className="w-full px-8 py-6 max-w-2xl mx-auto flex justify-center">
      <a href={props.url} className={`inline-block px-8 py-3 rounded-full font-semibold transition-colors ${cls}`}>{props.text}</a>
    </div>
  )
}

function GalleryBlock({ props }: { props: GalleryBlockProps }) {
  if (!props.images.length) return null
  const cols = props.columns ?? 3
  const gridClass = cols === 2 ? 'grid-cols-2' : cols === 4 ? 'grid-cols-4' : 'grid-cols-3'
  return (
    <div className="w-full px-8 py-8 max-w-2xl mx-auto">
      <div className={`grid ${gridClass} gap-3`}>
        {props.images.map((img, i) => (
          <div key={i} className="aspect-square overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  )
}

// 메인 라우터
export function PublicBlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'header':  return <HeaderBlock  props={block.props as HeaderBlockProps}  />
    case 'text':    return <TextBlock    props={block.props as TextBlockProps}    />
    case 'image':   return <ImageBlock   props={block.props as ImageBlockProps}   />
    case 'gallery': return <GalleryBlock props={block.props as GalleryBlockProps} />
    case 'map':     return <MapBlock     props={block.props as MapBlockProps}     />
    case 'contact': return <ContactBlock props={block.props as ContactBlockProps} />
    case 'hours':   return <HoursBlock   props={block.props as HoursBlockProps}   />
    case 'social':  return <SocialBlock  props={block.props as SocialBlockProps}  />
    case 'button':  return <ButtonBlock  props={block.props as ButtonBlockProps}  />
    case 'divider': return <hr className="border-t-2 border-gray-200 mx-8 my-4" />
    default:        return null
  }
}
