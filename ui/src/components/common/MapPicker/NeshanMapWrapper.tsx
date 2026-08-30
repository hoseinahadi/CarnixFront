'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react'

interface MapLocation {
  lat: number
  lng: number
}

interface NeshanMapWrapperProps {
  center: MapLocation
  marker: MapLocation | null
  onMapClick: (lat: number, lng: number) => void
}

const NESHAN_API_KEY = process.env.NEXT_PUBLIC_NESHAN_API_KEY || ''
const NESHAN_SDK_URL = 'https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.js'
const NESHAN_CSS_URL = 'https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.css'

/*
 * Promise در سطح ماژول باعث می‌شود اگر چند نمونه Map هم‌زمان mount شوند،
 * SDK فقط یک بار دانلود شود. در صورت failure برای Retry بعدی reset می‌شود.
 */
let neshanSdkPromise: Promise<void> | null = null

const ensureNeshanSdk = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Neshan SDK is browser-only'))
  }

  if ((window as any).L) {
    return Promise.resolve()
  }

  if (neshanSdkPromise) {
    return neshanSdkPromise
  }

  neshanSdkPromise = new Promise<void>((resolve, reject) => {
    if (!document.querySelector(`link[href="${NESHAN_CSS_URL}"]`)) {
      const linkEl = document.createElement('link')
      linkEl.rel = 'stylesheet'
      linkEl.href = NESHAN_CSS_URL
      document.head.appendChild(linkEl)
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${NESHAN_SDK_URL}"]`,
    )

    const script = existingScript ?? document.createElement('script')

    let settled = false
    const finish = (callback: () => void) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeoutId)
      script.removeEventListener('load', handleLoad)
      script.removeEventListener('error', handleError)
      callback()
    }

    const handleLoad = () => {
      finish(() => {
        if ((window as any).L) resolve()
        else reject(new Error('Neshan SDK loaded without Leaflet'))
      })
    }

    const handleError = () => {
      finish(() => {
        if (!existingScript) script.remove()
        reject(new Error('Failed to load Neshan SDK'))
      })
    }

    const timeoutId = window.setTimeout(() => {
      finish(() => {
        if (!existingScript) script.remove()
        reject(new Error('Neshan SDK load timeout'))
      })
    }, 12_000)

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })

    if (!existingScript) {
      script.src = NESHAN_SDK_URL
      script.async = true
      document.head.appendChild(script)
    }
  }).catch((error) => {
    neshanSdkPromise = null
    throw error
  })

  return neshanSdkPromise
}

const NeshanMapWrapper: React.FC<NeshanMapWrapperProps> = ({
  center,
  marker,
  onMapClick,
}) => {
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const clickHandlerRef = useRef(onMapClick)
  const centerRef = useRef(center)
  const [retryNonce, setRetryNonce] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    clickHandlerRef.current = onMapClick
  }, [onMapClick])

  useEffect(() => {
    centerRef.current = center
  }, [center])

  /*
   * Initialize فقط هنگام mount یا Retry اجرا می‌شود. center در dependency نیست؛
   * بنابراین حرکت marker یا تغییر مرکز باعث destroy/recreate شدن کل Map نمی‌شود.
   */
  useEffect(() => {
    let cancelled = false
    let resizeObserver: ResizeObserver | null = null

    const initialize = async () => {
      setIsLoading(true)
      setLoadError(null)

      try {
        await ensureNeshanSdk()
        if (cancelled || !containerRef.current) return

        const L = (window as any).L
        if (!L) throw new Error('Leaflet not available')

        const initialCenter = centerRef.current
        const map = L.map(containerRef.current, {
          center: [initialCenter.lat, initialCenter.lng],
          zoom: 15,
          zoomControl: true,
          attributionControl: false,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          dragging: true,
        })

        L.tileLayer(
          `https://api.neshan.org/v2/map/{z}/{x}/{y}?key=${NESHAN_API_KEY}`,
          { maxZoom: 19, minZoom: 4 },
        ).addTo(map)

        map.on('click', (event: any) => {
          clickHandlerRef.current(event.latlng.lat, event.latlng.lng)
        })

        resizeObserver = new ResizeObserver(() => {
          map.invalidateSize()
        })
        resizeObserver.observe(containerRef.current)

        if (cancelled) {
          resizeObserver.disconnect()
          map.remove()
          return
        }

        mapRef.current = map
        setIsLoading(false)
      } catch (error: unknown) {
        if (cancelled) return
        setLoadError(
          error instanceof Error && error.message.includes('timeout')
            ? 'زمان بارگذاری نقشه به پایان رسید. دوباره تلاش کنید.'
            : 'خطا در بارگذاری نقشه نشان',
        )
        setIsLoading(false)
      }
    }

    void initialize()

    return () => {
      cancelled = true
      resizeObserver?.disconnect()

      if (markerRef.current && mapRef.current) {
        try {
          mapRef.current.removeLayer(markerRef.current)
        } catch {
          // map ممکن است در حال cleanup باشد.
        }
      }
      markerRef.current = null

      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [retryNonce])

  useEffect(() => {
    if (!mapRef.current) return

    const currentCenter = mapRef.current.getCenter()
    if (
      Math.abs(currentCenter.lat - center.lat) > 0.0001 ||
      Math.abs(currentCenter.lng - center.lng) > 0.0001
    ) {
      mapRef.current.setView(
        [center.lat, center.lng],
        mapRef.current.getZoom(),
        { animate: true, duration: 0.3 },
      )
    }
  }, [center.lat, center.lng])

  useEffect(() => {
    if (!mapRef.current) return

    try {
      const L = (window as any).L
      if (!L) return

      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current)
        markerRef.current = null
      }

      if (!marker) return

      const customIcon = L.divIcon({
        className: 'neshan-custom-marker',
        html: `
          <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.25"/></filter>
            <path d="M18 0C8.06 0 0 8.06 0 18C0 31.5 18 48 18 48C18 48 36 31.5 36 18C36 8.06 27.94 0 18 0Z" fill="#e53935" filter="url(#shadow)"/>
            <circle cx="18" cy="18" r="8" fill="white"/>
            <circle cx="18" cy="18" r="4" fill="#e53935"/>
          </svg>
        `,
        iconSize: [36, 48],
        iconAnchor: [18, 48],
        popupAnchor: [0, -48],
      })

      const nextMarker = L.marker([marker.lat, marker.lng], {
        icon: customIcon,
        draggable: true,
        autoPan: true,
      })
        .addTo(mapRef.current)
        .bindPopup('📍 موقعیت انتخاب شده')
        .openPopup()

      nextMarker.on('dragend', () => {
        const position = nextMarker.getLatLng()
        if (position) {
          clickHandlerRef.current(position.lat, position.lng)
        }
      })

      markerRef.current = nextMarker
      mapRef.current.setView(
        [marker.lat, marker.lng],
        mapRef.current.getZoom(),
        { animate: true, duration: 0.3 },
      )

      return () => {
        if (markerRef.current === nextMarker && mapRef.current) {
          try {
            mapRef.current.removeLayer(nextMarker)
          } catch {
            // cleanup هم‌زمان map مشکلی ایجاد نکند.
          }
          markerRef.current = null
        }
      }
    } catch {
      return
    }
  }, [marker?.lat, marker?.lng, isLoading])

  const handleRetry = useCallback(() => {
    setRetryNonce((value) => value + 1)
  }, [])

  if (loadError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '200px',
        background: '#f8fafc',
        color: '#64748b',
        gap: '16px',
        padding: '24px',
        textAlign: 'center',
      }}>
        <AlertTriangle size={48} style={{ color: '#f59e0b', opacity: 0.7 }} />
        <p style={{ fontSize: '1rem', maxWidth: '280px', lineHeight: 1.6, margin: 0 }}>
          {loadError}
        </p>
        <button
          onClick={handleRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            background: '#1a73e8',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '1rem',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          <RefreshCw size={16} />
          تلاش مجدد
        </button>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'crosshair',
          zIndex: 1,
          visibility: isLoading ? 'hidden' : 'visible',
        }}
      />

      {isLoading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          background: '#f8fafc',
          gap: '12px',
          color: '#94a3b8',
        }}>
          <Loader2 size={32} style={{ animation: 'spin 0.8s linear infinite', color: '#1a73e8' }} />
          <p style={{ fontSize: '1rem', margin: 0 }}>در حال بارگذاری نقشه نشان...</p>
        </div>
      )}
    </div>
  )
}

export default React.memo(NeshanMapWrapper, (prev, next) => {
  return (
    prev.center.lat === next.center.lat &&
    prev.center.lng === next.center.lng &&
    prev.marker?.lat === next.marker?.lat &&
    prev.marker?.lng === next.marker?.lng &&
    prev.onMapClick === next.onMapClick
  )
})
