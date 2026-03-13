'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
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
  route?: Array<{ name: string; lat: number; lng: number }>
  days: any[]
  totalCost: number
  summary: string
  tips: string[]
}

import { useLanguage } from '@/lib/i18n'

function ItineraryContent() {
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState(0)

  useEffect(() => {
    const stored = sessionStorage.getItem('currentItinerary')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setItinerary(data)
      } catch (e) {
        console.error('Error parsing stored itinerary:', e)
      }
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-primary animate-spin">sync</span>
          <p className="mt-4 text-slate-600 font-bold">{t('iti_loading')}</p>
        </div>
      </div>
    )
  }

  if (!itinerary) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-slate-300">map</span>
          <h1 className="mt-4 text-2xl font-bold">{t('iti_not_found')}</h1>
          <p className="mt-2 text-slate-500">{t('iti_generate_new')}</p>
          <a href="/" className="mt-4 inline-block px-6 py-2 bg-primary text-white rounded-lg font-bold">
            {t('iti_go_home')}
          </a>
        </div>
      </div>
    )
  }

  const activeDayData = itinerary.days?.[activeDay]
  
  // Get locations for the map
  let mapLocations: any[] = []
  
  // Always include the route waypoints if it's a road trip
  if (itinerary.transportType === 'car' && itinerary.route) {
    mapLocations = [
      ...itinerary.route.map((stop, index) => ({
        id: `route-${index}`,
        name: stop.name,
        lat: stop.lat,
        lng: stop.lng,
        type: 'route' as const,
      })),
      // Also include current day's activities
      ...(activeDayData?.items || []).map((item: any, index: number) => ({
        id: item.id || `${activeDay}-${index}`,
        name: item.name || '',
        lat: item.location?.lat,
        lng: item.location?.lng,
        type: item.type || 'activity',
      })).filter((item: any) => item.lat && item.lng)
    ]
  } else {
    // Show day's activities
    mapLocations = (activeDayData?.items || []).map((item: any, index: number) => ({
      id: item.id || `${activeDay}-${index}`,
      name: item.name || '',
      lat: item.location?.lat,
      lng: item.location?.lng,
      type: item.type || 'activity',
    })).filter((item: any) => item.lat && item.lng)
  }

  const budgetItems = [
    { label: t('form_transport'), icon: 'flight', cost: Math.round(itinerary.totalCost * 0.3) },
    { label: t('tour_relaxed'), icon: 'hotel', cost: Math.round(itinerary.totalCost * 0.35) },
    { label: t('interest_gastronomy'), icon: 'restaurant', cost: Math.round(itinerary.totalCost * 0.2) },
    { label: t('form_interests'), icon: 'confirmation_number', cost: Math.round(itinerary.totalCost * 0.15) },
  ]

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <section className="w-[60%] flex flex-col overflow-y-auto bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 custom-scrollbar">
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 pt-4 border-b border-slate-100 dark:border-slate-800">
          {itinerary.transportType === 'car' && itinerary.route && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                🚗 {t('iti_road_trip_msg')}: {itinerary.origin} → {itinerary.destination}
              </p>
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
            {itinerary.days?.map((day: any, index: number) => (
              <button
                key={index}
                onClick={() => setActiveDay(index)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  activeDay === index
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t('iti_day_label')} {day.day || index + 1}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-8 pt-16 max-w-3xl mx-auto w-full">
          <div className="mb-6">
            <h2 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
              {activeDayData?.title || `${t('iti_day_label')} ${activeDay + 1}`}
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
              {activeDayData?.description}
            </p>
          </div>

          <div className="space-y-0 relative">
            {(activeDayData?.items || []).map((item: any, itemIndex: number) => (
              <TimelineItem
                key={itemIndex}
                item={{
                  id: item.id || `${activeDay}-${itemIndex}`,
                  type: item.type || 'activity',
                  name: item.name || '',
                  description: item.description || '',
                  detailedDescription: item.detailedDescription,
                  time: item.time || '09:00',
                  duration: item.duration || `2 ${t('iti_hours_label')}`,
                  cost: item.cost,
                  imageSearchTerm: item.imageSearchTerm,
                  rating: item.rating,
                }}
                index={itemIndex}
                destination={itinerary.destination}
              />
            ))}
          </div>

          {itinerary.tips && activeDay === 0 && (
            <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">lightbulb</span>
                {t('iti_tips_label')}
              </h3>
              <ul className="space-y-3">
                {itinerary.tips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-base text-slate-600 dark:text-slate-400">
                    • {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="w-[40%] relative bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="absolute inset-0">
          <InteractiveMap 
            locations={mapLocations}
            center={mapLocations[0] ? [mapLocations[0].lat, mapLocations[0].lng] as [number, number] : undefined}
          />
        </div>

        <div className="absolute bottom-6 left-6 right-6 z-20">
          <BudgetPanel items={budgetItems} total={itinerary.totalCost || 0} />
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

export default function ItineraryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="relative size-24 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">TripNovaAI</p>
        </div>
      </div>
    }>
      <ItineraryContent />
    </Suspense>
  )
}
