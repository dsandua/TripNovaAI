'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TravelForm from '@/components/forms/TravelForm'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useEffect } from 'react'

const carouselImages = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80', // Paris
  'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=1920&q=80', // New York
  'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&q=80', // Rome (New)
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80', // London
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1920&q=80', // Tokyo
];

const popularItineraries = [
  {
    id: 'amalfi-coast-7-days',
    titleKey: 'pop_amalfi_title',
    locationKey: 'pop_amalfi_loc',
    descriptionKey: 'pop_amalfi_desc',
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80',
    durationKey: 'pop_amalfi_dur',
    rating: 4.9,
    price: '1.250',
    tag: 'card_popular'
  },
  {
    id: 'kyoto-5-days',
    titleKey: 'pop_kyoto_title',
    locationKey: 'pop_kyoto_loc',
    descriptionKey: 'pop_kyoto_desc',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    durationKey: 'pop_kyoto_dur',
    rating: 4.8,
    price: '1.800',
    tag: 'card_culture'
  },
  {
    id: 'santorini-10-days',
    titleKey: 'pop_santorini_title',
    locationKey: 'pop_santorini_loc',
    descriptionKey: 'pop_santorini_desc',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    durationKey: 'pop_santorini_dur',
    rating: 5.0,
    price: '2.400',
    tag: 'card_luxury'
  },
]

export default function HomePage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleCardClick = async (destination: string, duration: string) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          destination, 
          duration, 
          language,
          budget: '1000-2000' // Default budget for quick clicks
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        sessionStorage.setItem('currentItinerary', JSON.stringify(result))
        router.push(`/itinerary?slug=${result.slug}`)
      } else {
        setError(result.error || t('form_error'))
        setLoading(false)
      }
    } catch (err) {
      setError(t('form_error'))
      setLoading(false)
    }
  }

  return (
    <div className="bg-background-light dark:bg-slate-950 min-h-screen">
      <section className="relative h-screen w-full overflow-hidden">
        {carouselImages.map((img, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${img}')`,
            }}
          />
        ))}

        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <div className="max-w-4xl space-y-10">
            <div>
              <h1 className="text-5xl md:text-8xl font-black text-white leading-[1.1] tracking-tighter drop-shadow-2xl mb-4">
                {t('hero_title')}
              </h1>
              <p className="text-lg md:text-2xl text-white/95 max-w-2xl mx-auto leading-relaxed drop-shadow-lg font-medium tracking-tight opacity-90">
                {t('hero_subtitle')}
              </p>
            </div>
            
            <div className="w-full max-w-3xl mx-auto backdrop-blur-md bg-white/10 dark:bg-slate-950/20 p-2 rounded-[2.5rem] shadow-2xl border border-white/20">
               <TravelForm />
            </div>
          </div>
        </div>
      </section>

      <section id="popular-itineraries" className="container mx-auto px-6 py-28 border-t border-slate-200/50 dark:border-slate-900/50">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="text-5xl font-black tracking-tighter mb-4 italic text-slate-900 dark:text-white leading-[0.9]">{t('popular_title')}</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xl font-medium">{t('popular_subtitle')}</p>
          </div>
          <Link href="/discover" className="inline-flex items-center justify-center h-16 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-600 dark:hover:bg-indigo-400 transition-all gap-3 shadow-premium hover:translate-x-1 active:translate-x-0">
            {t('view_all')} <span className="material-symbols-outlined text-xl">arrow_right_alt</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {popularItineraries.map((itinerary) => (
            <button key={itinerary.id} onClick={() => handleCardClick(t(itinerary.locationKey), t(itinerary.durationKey))} className="group text-left focus:outline-none transition-transform hover:-translate-y-2">
              <Card variant="hover" className="h-full overflow-hidden rounded-[2.5rem] relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl">
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={itinerary.image}
                    alt={t(itinerary.titleKey)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                    <span className="px-5 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-[0.1em] border border-white/30">
                      {t(itinerary.tag)}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                </div>
                <div className="p-8 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-sky-400 transition-colors leading-tight max-w-[70%]">{t(itinerary.titleKey)}</h3>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">{t('card_price_from')}</span>
                      <span className="text-xl font-black text-indigo-600 dark:text-sky-400 leading-tight">{itinerary.price}€</span>
                    </div>
                  </div>
                  
                  <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-bold mb-6">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    {t(itinerary.locationKey)}
                  </p>

                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 opacity-80 line-clamp-2">
                    {t(itinerary.descriptionKey)}
                  </p>

                  <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100/50 dark:border-amber-900/20">
                        <span className="material-symbols-outlined text-amber-500 text-base fill-amber-500">star</span>
                        <span className="text-sm font-black text-amber-900 dark:text-amber-400">{itinerary.rating}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        <span className="text-xs font-black uppercase tracking-[0.05em]">{t(itinerary.durationKey)}</span>
                      </div>
                    </div>
                    
                    <span className="text-indigo-600 dark:text-sky-400 group-hover:translate-x-2 transition-transform">
                      <span className="material-symbols-outlined text-2xl">arrow_forward_ios</span>
                    </span>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </section>
      
      <LoadingOverlay isOpen={loading} />
    </div>
  )
}

