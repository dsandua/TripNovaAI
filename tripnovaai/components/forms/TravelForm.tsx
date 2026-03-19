'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Autocomplete from '@/components/ui/Autocomplete'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import LoadingOverlay from '@/components/ui/LoadingOverlay'
import { useLanguage } from '@/lib/i18n'

export interface TravelFormData {
  origin: string
  destination: string
  transportType: 'plane' | 'car'
  travelers: string
  duration: string
  budget: string
  travelType: string
  interests: string[]
  includeFlights: 'no' | 'include' | 'show'
  departureAirport?: string
  arrivalTime?: string
  departureTime?: string
  flexibleDates?: boolean
  language: string // Pass language to AI
}

export default function TravelForm() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<TravelFormData>({
    origin: '',
    destination: '',
    transportType: 'plane',
    travelers: '2',
    duration: '3-5',
    budget: '1000-2000',
    travelType: 'cultural',
    interests: [],
    includeFlights: 'no',
    arrivalTime: '10:00',
    departureTime: '18:00',
    language: language
  })

  const travelTypes = [
    { value: 'cultural', label: t('tour_cultural') || 'Cultural Immersion' },
    { value: 'gastronomic', label: t('tour_gastronomic') || 'Gastronomic Tour' },
    { value: 'nature', label: t('tour_nature') || 'Nature & Wildlife' },
    { value: 'adventure', label: t('tour_adventure') || 'Adventure Sports' },
    { value: 'road_trip', label: t('tour_road_trip') || 'Road Trip' },
    { value: 'explorer', label: t('tour_explorer') || 'Explorer' },
    { value: 'relaxed', label: t('tour_relaxed') || 'Relaxed Travel' },
    { value: 'weekend', label: t('tour_weekend') || 'Weekend Escape' },
  ]

  const durations = [
    { value: 'weekend', label: t('dur_weekend') || 'Weekend' },
    { value: '3-5', label: t('dur_3_5') || '3-5 Days' },
    { value: '1_week', label: t('dur_1_week') || '1 Week' },
    { value: '2_weeks', label: t('dur_2_weeks') || '2+ Weeks' },
  ]

  const travelers = [
    { value: '1', label: t('trav_solo') || 'Solo' },
    { value: '2', label: t('trav_couple') || 'Couple' },
    { value: '3-5', label: t('trav_family') || 'Family' },
    { value: '6+', label: t('trav_group') || 'Group' },
  ]

  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const handleCancel = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
    setLoading(false)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.destination) {
      alert(t('err_no_destination'));
      setError(t('err_no_destination_first'));
      return;
    }
    
    console.log('--- FORM SUBMITTING ---');
    setError('');
    setLoading(true);

    const controller = new AbortController()
    setAbortController(controller)

    const timeout = setTimeout(() => {
      if (loading) {
        setError(t('err_timeout'));
        setLoading(false);
      }
    }, 45000); // 45s safety timeout

    try {
      console.log('Generating itinerary...', formData);
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, language }),
        signal: controller.signal
      })

      let result;
      try {
        result = await response.json();
      } catch (parseErr) {
        if (controller.signal.aborted) return // Ignore if cancelled
        console.error('Failed to parse response:', parseErr);
        setError(t('err_server'));
        setLoading(false);
        return;
      }
      
      if (result.success) {
        sessionStorage.setItem('currentItinerary', JSON.stringify(result))
        router.push(`/itinerary?slug=${result.slug}`)
      } else {
        console.error('Generation failed:', result.error);
        setError(result.error || t('form_error'))
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Fetch aborted by user');
        return
      }
      console.error('Fetch error:', err);
      setError(t('form_error'))
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
        setAbortController(null)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 p-1">
      {/* 1. Destination */}
      <div className="space-y-4">
        <Autocomplete
          label={t('form_destination')}
          placeholder={t('form_destination_placeholder')}
          value={formData.destination}
          onChange={(val) => setFormData({ ...formData, destination: val })}
          icon={<span className="material-symbols-outlined text-sm">place</span>}
        />
      </div>

      {/* 2. Duration */}
      <div className="space-y-4">
        <Select
          label={t('form_duration')}
          options={durations}
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
        />
      </div>

      {/* Submit Section */}
      <div className="md:col-span-2 mt-4">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-[1.5rem] border border-red-100 dark:border-red-900/20 text-sm font-bold animate-shake">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span className="line-clamp-3">
                {error.length > 200 ? `${t('form_error')} (Inténtalo de nuevo)` : error}
              </span>
            </div>
          </div>
        )}
        <Button 
          type="submit" 
          size="lg" 
          className="w-full h-16 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-premium transform transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3" 
          isLoading={loading}
        >
          <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          {loading ? t('form_loading') : t('form_btn_generate')}
        </Button>
      </div>

      <LoadingOverlay isOpen={loading} onCancel={handleCancel} />
    </form>
  )
}
