// Design Ref: §3.2, M8 — MapBlock (카카오맵 임베드)
'use client'

import { useEffect, useRef } from 'react'
import type { MapBlockProps } from '@homepage-builder/shared'

interface Props {
  blockId: string
  props: MapBlockProps
  isSelected: boolean
}

// 카카오맵 SDK 타입 선언
declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (callback: () => void) => void
        Map: new (container: HTMLElement, options: { center: unknown; level: number }) => unknown
        LatLng: new (lat: number, lng: number) => unknown
        Marker: new (options: { position: unknown }) => { setMap: (map: unknown) => void }
        services: {
          Geocoder: new () => {
            addressSearch: (
              address: string,
              callback: (result: Array<{ y: string; x: string }>, status: string) => void
            ) => void
          }
          Status: { OK: string }
        }
      }
    }
  }
}

function KakaoMapEmbed({ address }: { address: string }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY

  useEffect(() => {
    if (!mapKey || !address || !mapRef.current) return

    // 카카오맵 SDK 동적 로드
    const script = document.getElementById('kakao-map-sdk')
    if (!script) {
      const s = document.createElement('script')
      s.id = 'kakao-map-sdk'
      s.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${mapKey}&libraries=services&autoload=false`
      s.async = true
      s.onload = () => initMap()
      document.head.appendChild(s)
    } else {
      initMap()
    }

    function initMap() {
      window.kakao?.maps.load(() => {
        if (!mapRef.current || !window.kakao) return
        const geocoder = new window.kakao.maps.services.Geocoder()
        geocoder.addressSearch(address, (result, status) => {
          if (status !== window.kakao!.maps.services.Status.OK || !result[0]) return
          const coords = new window.kakao!.maps.LatLng(Number(result[0].y), Number(result[0].x))
          const map = new window.kakao!.maps.Map(mapRef.current!, { center: coords, level: 3 })
          const marker = new window.kakao!.maps.Marker({ position: coords })
          marker.setMap(map)
        })
      })
    }
  }, [address, mapKey])

  if (!mapKey) {
    // NEXT_PUBLIC_KAKAO_MAP_KEY 없을 때 폴백
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
        <a
          href={`https://map.kakao.com/link/search/${encodeURIComponent(address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          카카오맵에서 보기 →
        </a>
      </div>
    )
  }

  return <div ref={mapRef} className="w-full aspect-video rounded-xl" />
}

export function MapBlock({ props, isSelected }: Props) {
  return (
    <div className="w-full px-8 py-8 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">오시는 길</h2>
      {props.address ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700 justify-center">
            <span>📍</span>
            <span>{props.address}</span>
          </div>
          <KakaoMapEmbed address={props.address} />
        </div>
      ) : (
        <div className={`w-full aspect-video bg-gray-100 rounded-xl flex items-center justify-center border-2 ${
          isSelected ? 'border-dashed border-brand-400' : 'border-gray-200'
        }`}>
          <p className="text-sm text-gray-400">속성 패널에서 주소를 입력하세요</p>
        </div>
      )}
    </div>
  )
}
