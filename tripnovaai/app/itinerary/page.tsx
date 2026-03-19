
'use client'

import { useState, Suspense, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import InteractiveMap from '@/components/map/InteractiveMap'
import TimelineItem from '@/components/itinerary/TimelineItem'
import BudgetPanel from '@/components/itinerary/BudgetPanel'
import { useLanguage } from '@/lib/i18n'

function ItineraryContent() {
  const searchParams = useSearchParams()
  const data = searchParams.get('data')
  const { t, language } = useLanguage()
  const [activeDay, setActiveDay] = useState(0)
  const [itinerary, setItinerary] = useState<any>(null)
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)

  const hasMarker = (item: any) => {
    return item.type !== 'transport' && 
           item.location?.lat !== undefined && 
           item.location?.lat !== null && 
           item.location?.lng !== undefined && 
           item.location?.lng !== null &&
           item.location?.lat !== 0;
  }

  useEffect(() => {
    if (data) {
      try {
        setItinerary(JSON.parse(decodeURIComponent(data)))
      } catch (e) {
        console.error('Error parsing itinerary data:', e)
      }
    } else {
      const stored = sessionStorage.getItem('currentItinerary')
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setItinerary(parsed)
        } catch (e) {
          console.error('Error parsing stored itinerary:', e)
        }
      }
    }
  }, [data])

  // Dynamic Content Translation
  useEffect(() => {
    if (!itinerary) return;

    const currentLang = itinerary.originalLanguage || (itinerary.title?.toLowerCase().includes('itinerario') ? 'es' : 'en');
    
    if (currentLang !== language) {
      const triggerTranslation = async () => {
        setIsTranslating(true);
        try {
          const response = await fetch('/api/translate-itinerary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              itinerary, 
              targetLang: language 
            }),
          });
          const result = await response.json();
          if (result.success) {
            setItinerary(result);
          }
        } catch (error) {
          console.error('Translation error:', error);
        } finally {
          setIsTranslating(false);
        }
      };
      
      triggerTranslation();
    }
  }, [language, itinerary?.id]); // Only re-translate on language change or different itinerary

  const activeDayData = itinerary?.days?.[activeDay] || itinerary?.days?.[0]
  
  const mapLocations = useMemo(() => {
    if (!activeDayData?.items) return []
    let markerIdx = 0;
    return activeDayData.items
      .filter((item: any) => hasMarker(item))
      .map((item: any) => ({
        id: item.id || `${activeDay}-${markerIdx++}`,
        name: item.name || '',
        lat: Number(item.location.lat),
        lng: Number(item.location.lng),
        type: item.type || 'activity',
      }))
  }, [activeDayData, activeDay])

  if (!itinerary) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-light dark:bg-slate-950">
        <div className="text-center p-16 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 max-w-lg shadow-premium">
          <span className="material-symbols-outlined text-7xl text-sky-200 dark:text-sky-800 mb-6 font-thin">explore_off</span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{t('trip_not_found')}</h1>
          <p className="text-slate-400 dark:text-slate-500 text-lg mb-8 leading-relaxed font-semibold">
            {t('trip_not_found_desc')}
          </p>
          <a href="/" className="inline-flex items-center justify-center px-10 h-16 bg-sky-500 hover:bg-sky-600 text-white rounded-3xl font-black transition-all hover:scale-105 active:scale-95 shadow-premium">
            {t('back_home')}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[1100px_1fr] h-[calc(100vh-120px)] w-full overflow-hidden bg-background-light dark:bg-slate-950 text-slate-600 dark:text-slate-400 relative z-0">
      {/* Translation Overlay */}
      {isTranslating && (
        <div className="absolute inset-0 z-[100] bg-slate-950/40 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
           <div className="size-20 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-6" />
           <p className="text-white font-black text-2xl tracking-tighter uppercase animate-pulse">{t('loading_itinerary') || 'Translating...'}</p>
        </div>
      )}
      {/* Sidebar - Pure Side Column */}
      <aside className="h-full flex flex-col bg-white/40 dark:bg-slate-800/20 backdrop-blur-2xl border-r border-slate-100 dark:border-white/10 relative z-50 shadow-premium overflow-hidden">
        <div className="p-8 pb-4 shrink-0 bg-gradient-to-b from-soft-sky/20 to-transparent dark:from-slate-800/10 flex justify-between items-start">
           <div>
             <div className="flex items-center gap-2 text-sky-500/80 dark:text-sky-400 uppercase text-[9px] font-black tracking-[0.4em] mb-1">
               <span className="material-symbols-outlined text-[14px] font-black">location_on</span>
               {itinerary?.destination}
             </div>
             <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight drop-shadow-sm">
               {itinerary?.title}
             </h1>
           </div>
        </div>

        {/* Days Navigation - Refined Pastel Style */}
        <div className="px-8 py-3 dark:bg-slate-800/20 border-b border-slate-50 dark:border-slate-800/50 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {itinerary.days?.map((day: any, index: number) => (
            <button
              key={index}
              onClick={() => setActiveDay(index)}
              className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-500 shrink-0 border-2 ${
                activeDay === index
                   ? 'bg-white dark:bg-[#131c3b]/60 border-sky-400/30 text-sky-600 dark:text-sky-300 shadow-premium-hover scale-[1.03]'
                   : 'bg-slate-50/50 dark:bg-[#131c3b]/20 border-transparent text-slate-400 dark:text-slate-500 hover:border-sky-100 dark:hover:border-sky-900 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              {t('day_label')} {day.day || index + 1}
            </button>
          ))}
        </div>

        {/* Timeline Area - Luminous Airy Design */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-12 pb-10 bg-gradient-to-b from-white/30 to-soft-lavender/10 dark:from-slate-900/20 dark:to-slate-950/20">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3">
                <div className="size-2 rounded-full bg-sky-400/40" />
                {activeDayData?.title || `${t('day_label')} ${activeDay + 1}`}
              </h2>
            </div>
            
            <div className="p-8 bg-sky-50/30 dark:bg-slate-800/60 rounded-[2.5rem] border border-sky-100/50 dark:border-white/10 shadow-sm backdrop-blur-md mb-12">
              <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed font-bold italic">
                {activeDayData?.description}
              </p>
            </div>

            <div className="space-y-0">
              {(() => {
                let pinCounter = 0;
                return activeDayData?.items?.map((item: any, idx: number) => {
                  const needsMarker = hasMarker(item);
                  const displayIndex = needsMarker ? pinCounter++ : -1;
                  const stableId = item.id || `${activeDay}-${needsMarker ? (pinCounter - 1) : idx}`;
                  
                  return (
                    <TimelineItem 
                      key={item.id || idx} 
                      item={item} 
                      index={displayIndex} 
                      destination={itinerary.destination}
                      onMouseEnter={() => setHoveredItemId(stableId)}
                      onMouseLeave={() => setHoveredItemId(null)}
                    />
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area: Vertical Split (Map 75%, Budget 25%) */}
      <main className="flex flex-col h-full bg-background-light dark:bg-[#0f172a] overflow-hidden">
        {/* Main Area: Full Map */}
        <div className="h-full relative shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          <div className="absolute inset-0">
            <InteractiveMap 
              locations={mapLocations}
              center={mapLocations[0] ? [mapLocations[0].lat, mapLocations[0].lng] : undefined}
              travelMode={itinerary.transportType === 'car' ? 'DRIVING' : 'WALKING'}
              hoveredId={hoveredItemId}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ItineraryPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-background-light" />}>
      <ItineraryContent />
    </Suspense>
  )
}
