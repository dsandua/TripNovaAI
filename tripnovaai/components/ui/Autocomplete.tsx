'use client'

import { useState, useEffect, useRef } from 'react'
import Input from './Input'

interface AutocompleteProps {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  icon?: React.ReactNode
  type?: string
  className?: string
}

export default function Autocomplete({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  icon, 
  type = 'city',
  className
}: AutocompleteProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      // Using Photon API (free, open source)
      // Correct filter for cities is osm_tag=place:city
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5${type === 'city' ? '&osm_tag=place:city' : ''}`
      const response = await fetch(url)
      
      if (!response.ok) throw new Error('Network response was not ok')
      
      const data = await response.json()
      
      if (!data || !data.features) {
        setSuggestions([])
        return
      }
      
      const uniqueSuggestions = data.features.map((f: any) => {
        const p = f.properties
        return {
          name: p.name,
          country: p.country,
          state: p.state,
          display: `${p.name}${p.state ? `, ${p.state}` : ''}${p.country ? `, ${p.country}` : ''}`
        }
      })
      setSuggestions(uniqueSuggestions)
      setShowDropdown(true)
    } catch (error) {
      console.error('Autocomplete error:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)
    
    // Debounce
    const timeoutId = setTimeout(() => {
      fetchSuggestions(val)
    }, 300)
    return () => clearTimeout(timeoutId)
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <Input
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={() => value.length >= 3 && setShowDropdown(true)}
        icon={icon}
        className={className}
      />
      
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl max-h-60 overflow-y-auto overflow-x-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
              onClick={() => {
                onChange(suggestion.display)
                setShowDropdown(false)
              }}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400 text-sm">
                  {type === 'city' ? 'location_city' : 'place'}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold truncate">{suggestion.name}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {suggestion.state ? `${suggestion.state}, ` : ''}{suggestion.country}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      
      {isLoading && (
        <div className="absolute right-3 top-10 flex items-center justify-center">
            <span className="material-symbols-outlined text-sm text-primary animate-spin">sync</span>
        </div>
      )}
    </div>
  )
}
