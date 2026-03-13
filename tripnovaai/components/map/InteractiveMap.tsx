'use client'

import { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'

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

function MapFallback() {
  return (
    <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
      <span className="material-symbols-outlined text-4xl text-slate-400 animate-spin">sync</span>
    </div>
  )
}

const MapContent = dynamic(
  () => import('./MapContent'),
  { 
    ssr: false,
    loading: () => <MapFallback />
  }
)

export default function InteractiveMap(props: InteractiveMapProps) {
  return (
    <Suspense fallback={<MapFallback />}>
      <MapContent {...props} />
    </Suspense>
  )
}
