'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api'

interface MapLocation {
  id: string
  name: string
  lat: number
  lng: number
  type: 'activity' | 'restaurant' | 'route' | 'hotel'
}

interface InteractiveMapProps {
  locations: MapLocation[]
  center?: [number, number]
  zoom?: number
  travelMode?: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT'
  hoveredId?: string | null
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0px'
}

export default function MapContent({ 
  locations,
  center = [41.9028, 12.4964], 
  zoom = 8,
  travelMode = 'DRIVING',
  hoveredId = null
}: InteractiveMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const mapCenter = useMemo(() => ({ lat: center[0], lng: center[1] }), [center[0], center[1]])
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<MapLocation | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const calculateRoute = useCallback(async () => {
    if (locations.length < 2) return

    const directionsService = new google.maps.DirectionsService()
    const validLocations = locations.filter(loc => !isNaN(loc.lat) && !isNaN(loc.lng))
    
    if (validLocations.length < 2) return

    const origin = { lat: validLocations[0].lat, lng: validLocations[0].lng }
    const destination = { lat: validLocations[validLocations.length - 1].lat, lng: validLocations[validLocations.length - 1].lng }
    const waypoints = validLocations.slice(1, -1).map(loc => ({
      location: { lat: loc.lat, lng: loc.lng },
      stopover: true
    }))

    try {
      const mode = (google.maps.TravelMode as any)[travelMode] || google.maps.TravelMode.DRIVING

      const results = await directionsService.route({
        origin,
        destination,
        waypoints,
        travelMode: mode,
      })
      setDirectionsResponse(results)
    } catch (e) {
      console.error('Route calculation failed:', e)
    }
  }, [locations, travelMode])

  useEffect(() => {
    if (isLoaded && locations.length >= 2) {
      calculateRoute()
    }
  }, [isLoaded, locations, calculateRoute])

  useEffect(() => {
    if (map && containerRef.current) {
      const observer = new ResizeObserver(() => {
        google.maps.event.trigger(map, 'resize')
      })
      observer.observe(containerRef.current)
      return () => observer.disconnect()
    }
  }, [map])

  const onLoad = useCallback((map: google.maps.Map) => {
    const bounds = new window.google.maps.LatLngBounds()
    if (locations.length > 0) {
      locations.forEach(loc => bounds.extend({ lat: loc.lat, lng: loc.lng }))
      
      map.fitBounds(bounds)
      
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom()! > 12) map.setZoom(12)
        google.maps.event.removeListener(listener)
      })
    }
    setMap(map)
  }, [locations])

  if (!isLoaded) return <div className="animate-pulse bg-slate-200 w-full h-full" />

  return (
    <div ref={containerRef} className="w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          backgroundColor: '#f8fafc'
        }}
      >
        {directionsResponse && (
          <DirectionsRenderer 
            directions={directionsResponse}
            options={{
              suppressMarkers: true
            }}
          />
        )}

        {locations.map((loc, index) => (
          <Marker
            key={loc.id || index}
            position={{ lat: loc.lat, lng: loc.lng }}
            label={{
              text: (index + 1).toString(),
              color: 'white',
              fontWeight: 'bold',
              fontSize: '12px'
            }}
            onClick={() => setSelectedPlace(loc)}
            animation={hoveredId === loc.id ? 1 : undefined} // 1 = BOUNCE
          />
        ))}

        {selectedPlace && (
          <InfoWindow
            position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
            onCloseClick={() => setSelectedPlace(null)}
          >
            <div className="p-2 text-slate-900 min-w-[200px]">
              <h3 className="font-bold border-b pb-1 mb-1">{selectedPlace.name}</h3>
              <p className="text-xs text-slate-500 uppercase font-black">{selectedPlace.type}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  )
}
