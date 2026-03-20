'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import TimelineItem from '@/components/itinerary/TimelineItem'
import BudgetPanel from '@/components/itinerary/BudgetPanel'
import InteractiveMap from '@/components/map/InteractiveMap'

interface ItineraryData {
  title: string
  slug: string
  destination: string
  origin: string
  duration: number
  travelType: string
  transportType: string
  budget: string
  interests: string[]
  days: any[]
  totalCost: number
  summary: string
  tips: string[]
}

export default function ItineraryPage() {
  const params = useParams()
  const slug = params?.slug as string
  const router = useRouter()
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to get from sessionStorage first
    const stored = sessionStorage.getItem('currentItinerary')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setItinerary(data)
        setLoading(false)
        return
      } catch (e) {
        console.error('Error parsing stored itinerary:', e)
      }
    }

    // If not in session, show not found
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-primary animate-spin">sync</span>
          <p className="mt-4 text-slate-600">Loading itinerary...</p>
        </div>
      </div>
    )
  }

  if (!itinerary) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-slate-300">map</span>
          <h1 className="mt-4 text-2xl font-bold">Itinerary not found</h1>
          <p className="mt-2 text-slate-500">Please generate a new itinerary</p>
          <a href="/" className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-lg">
            Go Home
          </a>
        </div>
      </div>
    )
  }

  const allLocations = itinerary.days?.flatMap((day: any, dayIndex: number) =>
    (day.items || []).map((item: any, index: number) => ({
      id: item.id || `${dayIndex}-${index}`,
      name: item.name || '',
      lat: item.location?.lat || 41.9 + (Math.random() - 0.5) * 0.1,
      lng: item.location?.lng || 12.5 + (Math.random() - 0.5) * 0.1,
      type: item.type || 'activity',
    }))
  ) || []

  const budgetItems = [
    { label: 'Transport', icon: 'flight', cost: Math.round(itinerary.totalCost * 0.3) },
    { label: 'Lodging', icon: 'hotel', cost: Math.round(itinerary.totalCost * 0.35) },
    { label: 'Food', icon: 'restaurant', cost: Math.round(itinerary.totalCost * 0.2) },
    { label: 'Activities', icon: 'confirmation_number', cost: Math.round(itinerary.totalCost * 0.15) },
  ]

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <section className="w-[60%] flex flex-col overflow-y-auto bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 custom-scrollbar">
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 pt-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
            {(itinerary.days || []).map((day: any, index: number) => (
              <button
                key={index}
                className="px-4 py-2 bg-primary text-white rounded-full text-sm font-bold whitespace-nowrap"
              >
                Day {day.day || index + 1}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-8 max-w-3xl mx-auto w-full">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {itinerary.title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {itinerary.destination} • {itinerary.duration} Days
            </p>
          </div>

          {(itinerary.days || []).map((day: any, dayIndex: number) => (
            <div key={dayIndex} className="space-y-0 relative">
              <h3 className="text-xl font-bold mb-4 mt-6">{day.title}</h3>
              {(day.items || []).map((item: any, itemIndex: number) => (
                <TimelineItem
                  key={itemIndex}
                  item={{
                    id: item.id || `${dayIndex}-${itemIndex}`,
                    type: item.type || 'activity',
                    name: item.name || '',
                    description: item.description || '',
                    time: item.time || '09:00',
                    duration: item.duration || '2 hours',
                    cost: item.cost,
                    image: item.image,
                    rating: item.rating,
                  }}
                  index={itemIndex}
                />
              ))}
            </div>
          ))}

          {itinerary.tips && (
            <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
              <h3 className="font-bold text-lg mb-3">Travel Tips</h3>
              <ul className="space-y-2">
                {itinerary.tips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-primary text-sm">lightbulb</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="w-[40%] relative bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="absolute inset-0">
          <InteractiveMap locations={allLocations} />
        </div>

        <div className="absolute bottom-6 left-6 right-6 z-20">
          <BudgetPanel budget={{ 
            total: itinerary.totalCost || 0,
            activities: Math.round(itinerary.totalCost * 0.15),
            food: Math.round(itinerary.totalCost * 0.2),
            transport: Math.round(itinerary.totalCost * 0.3),
            currency: '€' 
          }} />
        </div>

        <div className="absolute top-6 right-6 flex flex-col gap-2 z-20">
          <button className="bg-white dark:bg-slate-900 size-10 rounded-lg shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">add</span>
          </button>
          <button className="bg-white dark:bg-slate-900 size-10 rounded-lg shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">remove</span>
          </button>
          <button className="bg-white dark:bg-slate-900 size-10 rounded-lg shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">my_location</span>
          </button>
        </div>
      </section>
    </div>
  )
}
