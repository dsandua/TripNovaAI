'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

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
}

function SetBounds({ locations }: { locations: MapLocation[] }) {
  const map = useMap()
  useEffect(() => {
    if (locations && locations.length > 0) {
      const validLocations = locations.filter(loc => !isNaN(loc.lat) && !isNaN(loc.lng))
      if (validLocations.length > 0) {
        const bounds = L.latLngBounds(validLocations.map(loc => [loc.lat, loc.lng]))
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [locations, map])
  return null
}

const createCustomIcon = (type: string, number?: number) => {
  const colors: Record<string, string> = {
    activity: '#f43f5e',
    restaurant: '#0ea5e9',
    route: '#10b981',
    hotel: '#8b5cf6',
  }
  const color = colors[type] || '#f43f5e'
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative group">
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-xl border-2 transition-transform group-hover:scale-110" style="border-color: ${color}">
          <span class="text-[10px] font-black" style="color: ${color}">${number || ''}</span>
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r-2 border-b-2 bg-white" style="border-color: ${color}"></div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  })
}

export default function MapContent({ locations, center = [41.9028, 12.4964], zoom = 13 }: InteractiveMapProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-slate-400 animate-spin">sync</span>
      </div>
    )
  }

  const polylinePositions = locations
    .filter(loc => !isNaN(loc.lat) && !isNaN(loc.lng))
    .map(loc => [loc.lat, loc.lng] as [number, number])

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full"
      style={{ background: '#f8f9fa' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <SetBounds locations={locations} />
      
      {polylinePositions.length > 1 && (
        <Polyline 
          positions={polylinePositions} 
          color="#3b82f6" 
          weight={4} 
          opacity={0.6} 
          dashArray="10, 10"
        />
      )}

      {locations.map((location, index) => (
        <Marker
          key={location.id || index}
          position={[location.lat, location.lng]}
          icon={createCustomIcon(location.type, index + 1)}
        >
          <Popup>
            <div className="p-1 min-w-[120px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-xs">
                  {location.type === 'activity' ? 'museum' : location.type === 'restaurant' ? 'restaurant' : location.type === 'route' ? 'hiking' : 'hotel'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  {location.type}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 leading-tight mb-1">{location.name}</h3>
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-500">
                    <span className="material-symbols-outlined text-[10px] filled-icon">star</span>
                    <span className="material-symbols-outlined text-[10px] filled-icon">star</span>
                    <span className="material-symbols-outlined text-[10px] filled-icon">star</span>
                    <span className="material-symbols-outlined text-[10px] filled-icon">star</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
