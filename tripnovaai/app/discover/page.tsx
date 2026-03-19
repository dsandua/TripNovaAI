'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import { useLanguage } from '@/lib/i18n'
import LoadingOverlay from '@/components/ui/LoadingOverlay'

const allDestinations = [
  { id: 1, titleKey: 'dest1_title', locationKey: 'dest1_loc', durationKey: 'dur_3_5', rating: 4.9, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80' },
  { id: 2, titleKey: 'dest2_title', locationKey: 'dest2_loc', durationKey: 'dur_1_week', rating: 4.8, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80' },
  { id: 3, titleKey: 'dest3_title', locationKey: 'dest3_loc', durationKey: 'dur_3_5', rating: 4.9, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80' },
  { id: 4, titleKey: 'dest4_title', locationKey: 'dest4_loc', durationKey: 'dur_1_week', rating: 5.0, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80' },
  { id: 5, titleKey: 'dest5_title', locationKey: 'dest5_loc', durationKey: 'dur_3_5', rating: 4.7, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80' },
  { id: 6, titleKey: 'dest6_title', locationKey: 'dest6_loc', durationKey: 'dur_3_5', rating: 4.8, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80' },
  { id: 7, titleKey: 'dest7_title', locationKey: 'dest7_loc', durationKey: 'dur_1_week', rating: 4.9, image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80' },
  { id: 8, titleKey: 'dest8_title', locationKey: 'dest8_loc', durationKey: 'dur_2_weeks', rating: 5.0, image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=800&q=80' },
  { id: 9, titleKey: 'dest9_title', locationKey: 'dest9_loc', durationKey: 'dur_2_weeks', rating: 4.7, image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=80' },
  { id: 10, titleKey: 'dest10_title', locationKey: 'dest10_loc', durationKey: 'dur_1_week', rating: 4.9, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80' },
  { id: 11, titleKey: 'dest11_title', locationKey: 'dest11_loc', durationKey: 'dur_3_5', rating: 4.6, image: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?w=800&q=80' },
  { id: 12, titleKey: 'dest12_title', locationKey: 'dest12_loc', durationKey: 'dur_3_5', rating: 4.8, image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&q=80' },
]

export default function DiscoverPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
          budget: '1000-2000'
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
    <div className="min-h-screen bg-background-light dark:bg-slate-950 relative overflow-hidden">
      {/* Decorative Background Elements - Pastel Palette */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-5">
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full bg-blue-50/60 blur-[120px]" />
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] rounded-full bg-emerald-50/60 blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] rounded-full bg-orange-50/60 blur-[130px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-blue-50/20 via-orange-50/10 to-emerald-50/20" />
      </div>

      {/* Premium Header Section */}
      <section className="relative pt-16 pb-24 border-b border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-indigo-100/50 dark:border-indigo-900/20 shadow-sm">
            <span className="material-symbols-outlined text-sm">explore</span>
            {t('disc_mode')}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white dark:text-white mb-6 tracking-tighter leading-tight italic">
            {t('disc_title')}
          </h1>
          <p className="text-slate-200 dark:text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            {t('disc_subtitle')}
          </p>
          
          {error && (
            <div className="mt-8 px-6 py-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold inline-block animate-shake shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">report</span>
                {error}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Destination Grid */}
      <section className="container mx-auto px-6 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {allDestinations.map((dest) => (
            <button key={dest.id} onClick={() => handleCardClick(t(dest.locationKey), dest.durationKey)} className="group text-left focus:outline-none h-full">
              <Card variant="hover" className="h-full overflow-hidden rounded-[2.5rem] flex flex-col">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={t(dest.titleKey)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&q=80'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="absolute bottom-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-xl transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100 font-black text-[10px] text-indigo-600 dark:text-indigo-400">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    {t('disc_generate_full')}
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                    {t(dest.titleKey)}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-bold italic opacity-70">
                    {t(dest.locationKey)}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <span className="material-symbols-outlined text-lg">calendar_month</span>
                      <span className="text-xs font-black uppercase tracking-widest">{t(dest.durationKey)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/50 rounded-lg">
                      <span className="material-symbols-outlined text-amber-500 text-sm fill-amber-500">star</span>
                      <span className="text-sm font-black text-amber-900 dark:text-amber-100">{dest.rating}</span>
                    </div>
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
