// components/common/MapPicker/NeshanMapWrapper.tsx
'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react'

// ===============================
// Types
// ===============================
interface MapLocation {
  lat: number
  lng: number
}

interface NeshanMapWrapperProps {
  center: MapLocation
  marker: MapLocation | null
  onMapClick: (lat: number, lng: number) => void
}

// ===============================
// Constants
// ===============================
const NESHAN_API_KEY = process.env.NEXT_PUBLIC_NESHAN_API_KEY || ''
const NESHAN_SDK_URL = 'https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.js'
const NESHAN_CSS_URL = 'https://static.neshan.org/sdk/leaflet/1.4.0/leaflet.css'

// ===============================
// NeshanMapWrapper Component
// ===============================
const NeshanMapWrapper: React.FC<NeshanMapWrapperProps> = ({
  center,
  marker,
  onMapClick,
}) => {
  // ===============================
  // Refs
  // ===============================
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const clickHandlerRef = useRef(onMapClick)
  const isInitializedRef = useRef(false)
  const sdkLoadedRef = useRef(false)
  const retryCountRef = useRef(0)

  // ===============================
  // State
  // ===============================
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Keep click handler updated
  useEffect(() => {
    clickHandlerRef.current = onMapClick
  }, [onMapClick])

  // ===============================
  // Load Neshan SDK
  // ===============================
  const loadNeshanSDK = useCallback(async (): Promise<boolean> => {
    if (sdkLoadedRef.current) return true

    try {
      // Load CSS
      if (!document.querySelector(`link[href="${NESHAN_CSS_URL}"]`)) {
        const linkEl = document.createElement('link')
        linkEl.rel = 'stylesheet'
        linkEl.href = NESHAN_CSS_URL
        document.head.appendChild(linkEl)
      }

      // Load JS
      if (!(window as any).L) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = NESHAN_SDK_URL
          script.async = true

          const timeoutId = setTimeout(() => {
            script.remove()
            reject(new Error('Neshan SDK load timeout'))
          }, 12000)

          script.onload = () => {
            clearTimeout(timeoutId)
            resolve()
          }

          script.onerror = () => {
            clearTimeout(timeoutId)
            script.remove()
            reject(new Error('Failed to load Neshan SDK'))
          }

          document.head.appendChild(script)
        })
      }

      sdkLoadedRef.current = true
      return true
    } catch (error: any) {
      console.error('❌ Neshan SDK load error:', error)
      setLoadError('خطا در بارگذاری کتابخانه نشان')
      return false
    }
  }, [])

  // ===============================
  // Initialize Map (ONLY ONCE)
  // ===============================
  const initializeMap = useCallback(async () => {
    if (!containerRef.current || isInitializedRef.current) return

    const sdkLoaded = await loadNeshanSDK()
    if (!sdkLoaded) {
      setIsLoading(false)
      return
    }

    try {
      const L = (window as any).L
      if (!L) throw new Error('Leaflet not available')

      const map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
      })

      // Add Neshan Tile Layer
      L.tileLayer(
        `https://api.neshan.org/v2/map/{z}/{x}/{y}?key=${NESHAN_API_KEY}`,
        { maxZoom: 19, minZoom: 4 }
      ).addTo(map)

      // Click handler
      map.on('click', (e: any) => {
        clickHandlerRef.current(e.latlng.lat, e.latlng.lng)
      })

      // Resize handler
      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize()
      })

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current)
      }

      mapRef.current = map
      isInitializedRef.current = true
      setIsLoading(false)
      setLoadError(null)

      return () => {
        resizeObserver.disconnect()
      }
    } catch (error: any) {
      console.error('❌ Neshan map init error:', error)
      setLoadError(error.message || 'خطا در راه‌اندازی نقشه')
      setIsLoading(false)
    }
  }, [center.lat, center.lng, loadNeshanSDK])

  // ===============================
  // Effect: Initialize
  // ===============================
  useEffect(() => {
    let cleanupFn: (() => void) | undefined

    initializeMap().then((cleanup) => {
      if (cleanup) cleanupFn = cleanup
    })

    return () => {
      if (cleanupFn) cleanupFn()
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        isInitializedRef.current = false
      }
    }
  }, [initializeMap])

  // ===============================
  // Effect: Update Center
  // ===============================
  useEffect(() => {
    if (mapRef.current && isInitializedRef.current && center) {
      const currentCenter = mapRef.current.getCenter()
      if (
        Math.abs(currentCenter.lat - center.lat) > 0.0001 ||
        Math.abs(currentCenter.lng - center.lng) > 0.0001
      ) {
        mapRef.current.setView([center.lat, center.lng], mapRef.current.getZoom(), {
          animate: true,
          duration: 0.3,
        })
      }
    }
  }, [center.lat, center.lng])

  // ===============================
  // Effect: Update Marker
  // ===============================
  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current) return

    try {
      const L = (window as any).L

      // Remove old marker
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current)
        markerRef.current = null
      }

      // Add new marker
      if (marker) {
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

        markerRef.current = L.marker([marker.lat, marker.lng], {
          icon: customIcon,
          draggable: true,
          autoPan: true,
        })
          .addTo(mapRef.current)
          .bindPopup('📍 موقعیت انتخاب شده')
          .openPopup()

        markerRef.current.on('dragend', () => {
          const position = markerRef.current?.getLatLng()
          if (position) {
            clickHandlerRef.current(position.lat, position.lng)
          }
        })

        mapRef.current.setView([marker.lat, marker.lng], mapRef.current.getZoom(), {
          animate: true,
          duration: 0.3,
        })
      }
    } catch (error) {
      console.error('Error updating marker:', error)
    }
  }, [marker?.lat, marker?.lng])

  // ===============================
  // Retry Handler
  // ===============================
  const handleRetry = useCallback(() => {
    setLoadError(null)
    setIsLoading(true)
    sdkLoadedRef.current = false
    isInitializedRef.current = false
    retryCountRef.current += 1

    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    setTimeout(() => {
      initializeMap()
    }, 200)
  }, [initializeMap])

  // ===============================
  // Render: Error State
  // ===============================
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
        <p style={{ fontSize: '0.875rem', maxWidth: '280px', lineHeight: 1.6, margin: 0 }}>
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
            fontSize: '0.8125rem',
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

  // ===============================
  // Render: Loading State
  // ===============================
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '200px',
        background: '#f8fafc',
        gap: '12px',
        color: '#94a3b8',
      }}>
        <Loader2 size={32} style={{ animation: 'spin 0.8s linear infinite', color: '#1a73e8' }} />
        <p style={{ fontSize: '0.8125rem', margin: 0 }}>در حال بارگذاری نقشه نشان...</p>
      </div>
    )
  }

  // ===============================
  // Render: Map
  // ===============================
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        cursor: 'crosshair',
        zIndex: 1,
      }}
    />
  )
}

// Memoize
export default React.memo(NeshanMapWrapper, (prev, next) => {
  return (
    prev.center.lat === next.center.lat &&
    prev.center.lng === next.center.lng &&
    prev.marker?.lat === next.marker?.lat &&
    prev.marker?.lng === next.marker?.lng
  )
})