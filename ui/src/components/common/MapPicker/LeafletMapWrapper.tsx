// components/common/MapPicker/LeafletMapWrapper.tsx
'use client'

import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ===============================
// Types
// ===============================
interface MapLocation {
  lat: number
  lng: number
}

interface LeafletMapWrapperProps {
  center: MapLocation
  marker: MapLocation | null
  onMapClick: (lat: number, lng: number) => void
}

// ===============================
// Fix Leaflet Default Icons
// ===============================
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

// ===============================
// Custom Marker Icon (SVG-based)
// ===============================
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.25"/>
        </filter>
        <path d="M18 0C8.06 0 0 8.06 0 18C0 31.5 18 48 18 48C18 48 36 31.5 36 18C36 8.06 27.94 0 18 0Z" fill="#1a73e8" filter="url(#shadow)"/>
        <circle cx="18" cy="18" r="8" fill="white"/>
        <circle cx="18" cy="18" r="4" fill="#1a73e8"/>
      </svg>
    `,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -48],
    tooltipAnchor: [0, -40],
  })
}

// ===============================
// LeafletMapWrapper Component
// ===============================
const LeafletMapWrapper: React.FC<LeafletMapWrapperProps> = ({
  center,
  marker,
  onMapClick,
}) => {
  // ===============================
  // Refs
  // ===============================
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const clickHandlerRef = useRef(onMapClick)
  const isInitializedRef = useRef(false)

  // Keep click handler updated without re-creating map
  useEffect(() => {
    clickHandlerRef.current = onMapClick
  }, [onMapClick])

  // ===============================
  // Initialize Map (ONLY ONCE)
  // ===============================
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return

    fixLeafletIcons()

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true,
      zoomAnimation: true,
    })

    // Add OSM Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      minZoom: 4,
      crossOrigin: true,
    }).addTo(map)

    // Click handler - uses ref to avoid re-binding
    map.on('click', (e: L.LeafletMouseEvent) => {
      clickHandlerRef.current(e.latlng.lat, e.latlng.lng)
    })

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    mapRef.current = map
    isInitializedRef.current = true

    return () => {
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
      isInitializedRef.current = false
    }
  }, []) // Empty deps - initialize only once

  // ===============================
  // Update Center (when center prop changes)
  // ===============================
  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current) return

    const currentCenter = mapRef.current.getCenter()
    const newCenter = L.latLng(center.lat, center.lng)

    // Only update if center actually changed
    if (!currentCenter.equals(newCenter)) {
      mapRef.current.setView(newCenter, mapRef.current.getZoom(), {
        animate: true,
        duration: 0.3,
      })
    }
  }, [center.lat, center.lng])

  // ===============================
  // Update Marker (when marker prop changes)
  // ===============================
  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current) return

    // Remove old marker
    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }

    // Add new marker
    if (marker) {
      const icon = createCustomIcon()

      markerRef.current = L.marker([marker.lat, marker.lng], {
        icon,
        draggable: true,
        autoPan: true,
        autoPanPadding: [50, 50],
        riseOnHover: true,
      })
        .addTo(mapRef.current)
        .bindPopup('📍 موقعیت انتخاب شده', {
          closeButton: true,
          autoClose: false,
          closeOnClick: false,
          className: 'custom-popup',
        })
        .openPopup()

      // Handle drag end
      markerRef.current.on('dragend', () => {
        const position = markerRef.current?.getLatLng()
        if (position) {
          clickHandlerRef.current(position.lat, position.lng)
        }
      })

      // Animate to marker
      mapRef.current.setView([marker.lat, marker.lng], mapRef.current.getZoom(), {
        animate: true,
        duration: 0.3,
      })
    }
  }, [marker?.lat, marker?.lng])

  // ===============================
  // Render
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

// Memoize to prevent unnecessary re-renders
export default React.memo(LeafletMapWrapper, (prev, next) => {
  return (
    prev.center.lat === next.center.lat &&
    prev.center.lng === next.center.lng &&
    prev.marker?.lat === next.marker?.lat &&
    prev.marker?.lng === next.marker?.lng
  )
})