'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Autocomplete from '@/components/ui/Autocomplete'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
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

  const interestsList = [
    'hiking', 'cycling', 'photography', 'scenic_viewpoints',
    'historic_towns', 'gastronomy', 'beaches', 'nature'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.destination) {
      setError(t('error_destination'))
      return
    }
    
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, language }),
      })

      const result = await response.json()
      
      if (result.success) {
        sessionStorage.setItem('currentItinerary', JSON.stringify(result))
        router.push(`/itinerary?slug=${result.slug}`)
      } else {
        setError(result.error || t('form_error'))
      }
    } catch (err) {
      setError(t('form_error'))
    } finally {
      setLoading(false)
    }
  }

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="space-y-4">
        <Autocomplete
          label={t('form_origin')}
          placeholder={t('form_origin_placeholder')}
          value={formData.origin}
          onChange={(val) => setFormData({ ...formData, origin: val })}
          icon={<span className="material-symbols-outlined text-sm">location_on</span>}
        />
        <Autocomplete
          label={t('form_destination')}
          placeholder={t('form_destination_placeholder')}
          value={formData.destination}
          onChange={(val) => setFormData({ ...formData, destination: val })}
          icon={<span className="material-symbols-outlined text-sm">place</span>}
        />
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-sm font-semibold mb-2 block">{t('form_transport')}</span>
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, transportType: 'plane' })}
              className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-1 transition-all ${
                formData.transportType === 'plane'
                  ? 'bg-white dark:bg-slate-700 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <span className="material-symbols-outlined text-sm">flight</span>
              {t('form_plane')}
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, transportType: 'car' })}
              className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-1 transition-all ${
                formData.transportType === 'car'
                  ? 'bg-white dark:bg-slate-700 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <span className="material-symbols-outlined text-sm">directions_car</span>
              {t('form_car')}
            </button>
          </div>
        </div>
        <Select
          label={t('form_travelers')}
          options={travelers}
          value={formData.travelers}
          onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <Select
          label={t('form_duration')}
          options={durations}
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
        />
        <Select
          label={t('form_budget')}
          options={[
            { value: '0-500', label: t('budget_low') || '$0 - $500' },
            { value: '500-1000', label: '$500 - $1,000' },
            { value: '1000-2000', label: '$1,000 - $2,000' },
            { value: '2000-3000', label: '$2,000 - $3,000' },
            { value: '3000+', label: t('budget_high') || '$3,000+' },
          ]}
          value={formData.budget}
          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <Select
          label={t('form_style')}
          options={travelTypes}
          value={formData.travelType}
          onChange={(e) => setFormData({ ...formData, travelType: e.target.value })}
        />
        <div>
          <span className="text-sm font-semibold mb-1 block">{t('form_interests')}</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {interestsList.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                  formData.interests.includes(interest)
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-slate-100 dark:bg-slate-800 border-transparent hover:bg-slate-200'
                }`}
              >
                {t(`interest_${interest}`) || interest.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 mt-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          <span className="material-symbols-outlined">auto_awesome</span>
          {loading ? t('form_loading') : t('form_btn_generate')}
        </Button>
      </div>
    </form>
  )
}
