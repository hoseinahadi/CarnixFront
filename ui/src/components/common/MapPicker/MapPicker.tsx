// components/common/MapPicker/MapPicker.tsx
'use client'

import React, { useState, useEffect, useCallback, useRef, memo } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Navigation, Search, AlertTriangle, Loader2, X } from 'lucide-react'
import styles from './MapPicker.module.scss'

// ===============================
// Loading Fallback
// ===============================
const MapLoadingFallback = () => (
  <div className={styles.loadingState}>
    <Loader2 size={32} className={styles.spinning} />
    <p>در حال بارگذاری نقشه...</p>
  </div>
)

// ===============================
// Dynamic Imports
// ===============================
const LeafletMapWrapper = dynamic(
  () => import('./LeafletMapWrapper'),
  { ssr: false, loading: MapLoadingFallback }
)

const NeshanMapWrapper = dynamic(
  () => import('./NeshanMapWrapper'),
  { ssr: false, loading: MapLoadingFallback }
)

// ===============================
// Types
// ===============================
export interface MapLocation {
  lat: number
  lng: number
}

export interface AddressSuggestion {
  address: string
  location: MapLocation
}

interface MapPickerProps {
  initialLocation?: MapLocation | null
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  height?: string
  showSearch?: boolean
  showCurrentLocation?: boolean
  placeholder?: string
  disabled?: boolean
}

// ===============================
// Constants
// ===============================
const DEFAULT_CENTER: MapLocation = { lat: 35.6892, lng: 51.3890 }
const SEARCH_DEBOUNCE_MS = 600
const OSM_TILE_URL = 'https://tile.openstreetmap.org/0/0/0.png'
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse'

// ===============================
// Helper Functions
// ===============================
const fetchWithTimeout = async (url: string, timeout = 5000) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, { signal: controller.signal })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

// ===============================
// MapPicker Component (Memoized)
// ===============================
const MapPicker: React.FC<MapPickerProps> = memo(({
  initialLocation,
  onLocationSelect,
  height = '400px',
  showSearch = true,
  showCurrentLocation = true,
  placeholder = 'جستجوی آدرس یا مکان...',
  disabled = false,
}) => {
  // ===============================
  // Refs
  // ===============================
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isMountedRef = useRef(true)
  const onLocationSelectRef = useRef(onLocationSelect)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Keep callback ref updated without triggering re-renders
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect
  }, [onLocationSelect])

  // ===============================
  // State
  // ===============================
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    initialLocation || null
  )
  const [currentLocation, setCurrentLocation] = useState<MapLocation | null>(null)
  const [mapProvider, setMapProvider] = useState<'leaflet' | 'neshan' | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AddressSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [showSearchResults, setShowSearchResults] = useState(false)

  // ===============================
  // Cleanup on unmount
  // ===============================
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // ===============================
  // Sync initialLocation prop
  // ===============================
  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation)
    }
  }, [initialLocation?.lat, initialLocation?.lng])

  // ===============================
  // Detect Map Provider (OSM or Neshan)
  // ===============================
  useEffect(() => {
    let cancelled = false

    const detectMapProvider = async () => {
      try {
        const response = await fetchWithTimeout(OSM_TILE_URL, 4000)
        if (!cancelled && response.ok) {
          console.log('✅ OpenStreetMap connected')
          setMapProvider('leaflet')
          return
        }
        throw new Error('OSM not available')
      } catch {
        if (!cancelled) {
          console.warn('⚠️ OSM unavailable, trying Neshan')
          const apiKey = process.env.NEXT_PUBLIC_NESHAN_API_KEY
          if (apiKey && apiKey !== 'YOUR_API_KEY') {
            setMapProvider('neshan')
          } else {
            setMapError('نقشه در دسترس نیست. لطفاً API Key نشان را تنظیم کنید.')
          }
        }
      }
    }

    detectMapProvider()

    return () => {
      cancelled = true
    }
  }, [])

  // ===============================
  // Get Current Location
  // ===============================
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند')
      return
    }

    setIsLocating(true)
    setLocationError(null)

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMountedRef.current) return
        const location: MapLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setCurrentLocation(location)
        if (!selectedLocation) {
          setSelectedLocation(location)
          onLocationSelectRef.current(location.lat, location.lng)
          reverseGeocode(location.lat, location.lng)
        }
        setIsLocating(false)
      },
      (error) => {
        if (!isMountedRef.current) return
        setIsLocating(false)
        const messages: Record<number, string> = {
          [error.PERMISSION_DENIED]: 'دسترسی به موقعیت مکانی رد شد',
          [error.POSITION_UNAVAILABLE]: 'موقعیت مکانی در دسترس نیست',
          [error.TIMEOUT]: 'زمان دریافت موقعیت به پایان رسید',
        }
        setLocationError(messages[error.code] || 'خطا در دریافت موقعیت مکانی')
      },
      options
    )
  }, [selectedLocation])

  // ===============================
  // Handle Map Click (Stable Reference)
  // ===============================
  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (disabled) return
    setSelectedLocation({ lat, lng })
    onLocationSelectRef.current(lat, lng)
    reverseGeocode(lat, lng)
  }, [disabled])

  // ===============================
  // Reverse Geocode (Coordinates → Address)
  // ===============================
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetchWithTimeout(
        `${NOMINATIM_REVERSE_URL}?format=json&lat=${lat}&lon=${lng}&accept-language=fa`
      )
      if (response.ok) {
        const data = await response.json()
        if (isMountedRef.current && data.display_name) {
          setSearchQuery(data.display_name)
        }
      }
    } catch {
      // Fallback to Neshan
      if (mapProvider === 'neshan') {
        const apiKey = process.env.NEXT_PUBLIC_NESHAN_API_KEY
        if (apiKey) {
          try {
            const response = await fetchWithTimeout(
              `https://api.neshan.org/v2/reverse?lat=${lat}&lng=${lng}`,
              4000
            )
            if (response.ok) {
              const data = await response.json()
              if (isMountedRef.current && data.formatted_address) {
                setSearchQuery(data.formatted_address)
              }
            }
          } catch {
            // Silent fail
          }
        }
      }
    }
  }, [mapProvider])

  // ===============================
  // Search Address (Nominatim)
  // ===============================
  const searchAddress = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setIsSearching(true)

    try {
      const params = new URLSearchParams({
        format: 'json',
        q: query,
        limit: '5',
        countrycodes: 'ir',
        'accept-language': 'fa',
      })

      const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params}`, {
        signal: abortControllerRef.current.signal,
      })

      if (response.ok) {
        const data = await response.json()
        if (isMountedRef.current && Array.isArray(data)) {
          const results: AddressSuggestion[] = data.map((item: any) => ({
            address: item.display_name,
            location: {
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            },
          }))
          setSearchResults(results)
          setShowSearchResults(results.length > 0)
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        // Fallback to Neshan search
        if (mapProvider === 'neshan') {
          await searchWithNeshan(query)
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsSearching(false)
      }
    }
  }, [mapProvider])

  // ===============================
  // Search with Neshan (Fallback)
  // ===============================
  const searchWithNeshan = async (query: string) => {
    const apiKey = process.env.NEXT_PUBLIC_NESHAN_API_KEY
    if (!apiKey || apiKey === 'YOUR_API_KEY') return

    try {
      const response = await fetchWithTimeout(
        `https://api.neshan.org/v1/search?term=${encodeURIComponent(query)}&lat=${DEFAULT_CENTER.lat}&lng=${DEFAULT_CENTER.lng}`,
        5000
      )

      if (response.ok) {
        const data = await response.json()
        if (isMountedRef.current && data.items) {
          const results: AddressSuggestion[] = data.items.map((item: any) => ({
            address: item.title || item.address || '',
            location: {
              lat: item.location?.y || 0,
              lng: item.location?.x || 0,
            },
          }))
          setSearchResults(results)
          setShowSearchResults(results.length > 0)
        }
      }
    } catch {
      if (isMountedRef.current) {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }
  }

  // ===============================
  // Select Address from Search Results
  // ===============================
  const handleSelectAddress = useCallback((suggestion: AddressSuggestion) => {
    setSelectedLocation(suggestion.location)
    setSearchQuery(suggestion.address)
    setSearchResults([])
    setShowSearchResults(false)
    onLocationSelectRef.current(
      suggestion.location.lat,
      suggestion.location.lng,
      suggestion.address
    )
    searchInputRef.current?.blur()
  }, [])

  // ===============================
  // Clear Search
  // ===============================
  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
    setShowSearchResults(false)
    searchInputRef.current?.focus()
  }, [])

  // ===============================
  // Debounced Search
  // ===============================
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchAddress(searchQuery)
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [searchQuery, searchAddress])

  // ===============================
  // Close search results on click outside
  // ===============================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (showSearchResults && !target.closest(`.${styles.searchBar}`)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSearchResults])

  // ===============================
  // Retry loading map
  // ===============================
  const handleRetryMap = useCallback(() => {
    setMapError(null)
    setMapProvider(null)
    // Re-trigger detection
    const detectMapProvider = async () => {
      try {
        const response = await fetchWithTimeout(OSM_TILE_URL, 4000)
        if (isMountedRef.current && response.ok) {
          setMapProvider('leaflet')
          return
        }
        throw new Error('OSM not available')
      } catch {
        if (isMountedRef.current) {
          const apiKey = process.env.NEXT_PUBLIC_NESHAN_API_KEY
          if (apiKey && apiKey !== 'YOUR_API_KEY') {
            setMapProvider('neshan')
          } else {
            setMapError('نقشه در دسترس نیست.')
          }
        }
      }
    }
    detectMapProvider()
  }, [])

  // ===============================
  // Computed Values
  // ===============================
  const mapCenter = selectedLocation || currentLocation || DEFAULT_CENTER

  // ===============================
  // Render
  // ===============================
  return (
    <div className={`${styles.mapPicker} ${disabled ? styles.disabled : ''}`}>
      {/* Search Bar */}
      {showSearch && (
        <div className={styles.searchBar}>
          <div className={styles.searchInputWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              ref={searchInputRef}
              type="text"
              className={styles.searchInput}
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              disabled={disabled}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={handleClearSearch}
                aria-label="پاک کردن جستجو"
              >
                <X size={16} />
              </button>
            )}
            {isSearching && (
              <Loader2 size={18} className={styles.searchingIcon} />
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className={styles.searchResults}>
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  className={styles.searchResultItem}
                  onClick={() => handleSelectAddress(result)}
                >
                  <MapPin size={16} className={styles.resultIcon} />
                  <span className={styles.resultText}>{result.address}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      {/* <div className={styles.toolbar}>
        {showCurrentLocation && (
          <button
            type="button"
            className={styles.locateBtn}
            onClick={getCurrentLocation}
            disabled={isLocating || disabled}
            title="موقعیت فعلی من"
          >
            {isLocating ? (
              <>
                <Loader2 size={16} className={styles.spinning} />
                <span>در حال دریافت...</span>
              </>
            ) : (
              <>
                <Navigation size={16} />
                <span>موقعیت فعلی</span>
              </>
            )}
          </button>
        )}

        {selectedLocation && (
          <div className={styles.coordinates}>
            <MapPin size={14} />
            <code>
              {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </code>
          </div>
        )}
      </div> */}

      {/* Location Error */}
      {locationError && (
        <div className={styles.errorBar}>
          <AlertTriangle size={16} />
          <span>{locationError}</span>
          <button
            type="button"
            onClick={() => setLocationError(null)}
            className={styles.dismissError}
            aria-label="بستن"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Map Container */}
      {!mapError ? (
        <div className={styles.mapContainer} style={{ height }}>
          {mapProvider === 'leaflet' && (
            <LeafletMapWrapper
              center={mapCenter}
              marker={selectedLocation}
              onMapClick={handleMapClick}
            />
          )}

          {mapProvider === 'neshan' && (
            <NeshanMapWrapper
              center={mapCenter}
              marker={selectedLocation}
              onMapClick={handleMapClick}
            />
          )}

          {!mapProvider && <MapLoadingFallback />}
        </div>
      ) : (
        /* Map Error State */
        <div className={styles.mapErrorState} style={{ height }}>
          <AlertTriangle size={48} className={styles.mapErrorIcon} />
          <p className={styles.mapErrorText}>{mapError}</p>
          <button
            type="button"
            className={styles.mapRetryBtn}
            onClick={handleRetryMap}
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {/* Hint */}
      
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  return (
    prevProps.initialLocation?.lat === nextProps.initialLocation?.lat &&
    prevProps.initialLocation?.lng === nextProps.initialLocation?.lng &&
    prevProps.height === nextProps.height &&
    prevProps.showSearch === nextProps.showSearch &&
    prevProps.showCurrentLocation === nextProps.showCurrentLocation &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.placeholder === nextProps.placeholder
  )
})

MapPicker.displayName = 'MapPicker'

export default MapPicker