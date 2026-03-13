'use client'

import { useEffect, useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface SavedItinerary {
  id: string
  title: string
  destination: string
  duration_days: number
  total_cost: number
  slug: string
  created_at: string
}

export default function SavedTripsPage() {
  const [trips, setTrips] = useState<SavedItinerary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTrips() {
      // In a real app, we would fetch based on user id
      // For now, we'll fetch all public itineraries or those without user_id
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setTrips(data as any)
      }
      setLoading(false)
    }

    fetchTrips()
  }, [])

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tight mb-4">My Saved Trips</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Revisit your generated itineraries and planned journeys.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/itinerary?slug=${trip.slug}`}>
              <Card variant="hover" className="p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="primary">Trip Plan</Badge>
                    <span className="text-xs text-slate-400">
                        {new Date(trip.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{trip.title}</h3>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-6">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {trip.destination}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1 text-primary">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span className="text-xs font-bold">{trip.duration_days} Days</span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    €{Number(trip.total_cost).toLocaleString()}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">map</span>
          <h2 className="text-xl font-bold mb-2">No saved trips yet</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Start by exploring or discovering new destinations to build your dream itinerary.
          </p>
          <Link href="/">
            <Button>Plan a Trip</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
