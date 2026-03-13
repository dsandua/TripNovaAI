'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Autocomplete from '@/components/ui/Autocomplete'
import { useLanguage } from '@/lib/i18n'

interface TripSuggestion {
  destination: string
  country: string
  image: string
  estimatedCost: number
  highlights: string[]
  accommodation: string
  activities: string
  rating: number
}

export default function DiscoverPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [trips, setTrips] = useState<TripSuggestion[]>([])
  const [formData, setFormData] = useState({
    origin: '',
    budget: '1000-2000',
    days: '7',
  })

  const handleDiscover = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/discover-trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, language }),
      })
      const result = await response.json()
      if (result.success) {
        setTrips(result.trips)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateFullItinerary = (destination: string) => {
    router.push(`/?destination=${encodeURIComponent(destination)}&generate=true`)
  }

  return (
    <div className="min-h-screen">
      <section className="relative rounded-xl overflow-hidden mb-12 min-h-[400px] flex flex-col justify-end p-8 md:p-16">
        <div className="absolute inset-0 z-0 bg-slate-900">
          <img
            alt="Breathtaking mountain landscape"
            className="w-full h-full object-cover opacity-60"
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/30 text-white text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            {t('disc_mode')}
          </span>
          <h1 className="text-white text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            {t('disc_title')}
          </h1>
          <p className="text-slate-200 text-lg md:text-xl mb-8">
            {t('disc_subtitle')}
          </p>
          
          <div className="bg-white/10 backdrop-blur-xl p-2 rounded-xl border border-white/20 flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px] flex flex-col justify-center px-4">
              <label className="block text-[10px] font-bold text-white/70 uppercase mb-1">
                {t('disc_origin')}
              </label>
              <Autocomplete
                label=""
                placeholder={t('disc_origin_placeholder')}
                value={formData.origin}
                onChange={(val) => setFormData({ ...formData, origin: val })}
                icon={<span className="material-symbols-outlined text-white/50 text-sm">location_on</span>}
                className="bg-transparent border-none text-white focus:ring-slate-300 w-full placeholder:text-white/40 !py-0 shadow-none border-b border-white/20 rounded-none focus:border-white"
              />
            </div>
            
            <div className="flex-1 min-w-[150px] border-l border-white/10">
              <label className="block text-[10px] font-bold text-white/70 uppercase ml-4 mt-1">
                {t('disc_budget')}
              </label>
              <div className="flex items-center px-4 pb-2">
                <span className="material-symbols-outlined text-white/50 mr-2">payments</span>
                <input
                  className="bg-transparent border-none text-white focus:ring-0 w-full placeholder:text-white/40"
                  placeholder="ej. 1500"
                  type="number"
                  value={formData.budget.replace('-', '')}
                  onChange={(e) => setFormData({ ...formData, budget: `0-${e.target.value}` })}
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-[150px] border-l border-white/10">
              <label className="block text-[10px] font-bold text-white/70 uppercase ml-4 mt-1">
                {t('disc_days')}
              </label>
              <div className="flex items-center px-4 pb-2">
                <span className="material-symbols-outlined text-white/50 mr-2">calendar_month</span>
                <input
                  className="bg-transparent border-none text-white focus:ring-0 w-full placeholder:text-white/40"
                  placeholder="ej. 7"
                  type="number"
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                />
              </div>
            </div>
            
            <button
              onClick={handleDiscover}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3 rounded-lg flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined">search</span>
              {loading ? t('disc_searching') : t('disc_btn_discover')}
            </button>
          </div>
        </div>
      </section>

      {trips.length > 0 && (
        <div className="container mx-auto px-6 pb-20">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-8">
            {t('disc_recommended')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip, index) => (
              <Card key={index} variant="hover" className="overflow-hidden group">
                <div className="h-56 relative overflow-hidden">
                  <img
                    alt={trip.destination}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={trip.image}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm">
                    <span className="text-primary font-bold text-sm">€{trip.estimatedCost.toLocaleString()}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-slate-900/60 backdrop-blur-sm px-2 py-1 rounded-md">
                    <div className="flex items-center gap-1 text-white text-xs">
                      <span className="material-symbols-outlined text-xs text-yellow-400">star</span>
                      <span>{trip.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="text-xl font-bold mb-2">{trip.destination}, {trip.country}</h4>
                  <div className="flex flex-col gap-3 mb-6">
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">hotel</span>
                      <p className="text-slate-600 dark:text-slate-400 text-sm italic line-clamp-1">
                        {trip.accommodation}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">map</span>
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                        {trip.activities}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={() => handleGenerateFullItinerary(trip.destination)}
                  >
                    {t('disc_generate_full')}
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {trips.length === 0 && !loading && (
        <div className="container mx-auto px-6 pb-20 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
            {t('disc_empty')}
          </p>
        </div>
      )}
    </div>
  )
}
