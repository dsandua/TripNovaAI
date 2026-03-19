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
    if (query.trim().length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      // Using Photon API (free, open source)
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

  // Ref for debouncing
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(val)
    }, 400)
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <Input
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={() => value.length >= 3 && setSuggestions.length > 0 && setShowDropdown(true)}
        icon={icon}
        className={className}
      />
      
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-[100] w-full mt-2 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-72 overflow-y-auto custom-scrollbar">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-b border-slate-50 dark:border-slate-800/50 last:border-0 group/item flex items-center gap-4"
                onClick={() => {
                  onChange(suggestion.display)
                  setShowDropdown(false)
                }}
              >
                <div className="size-11 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center group-hover/item:scale-110 transition-transform shadow-sm">
                  <span className="material-symbols-outlined text-sky-500 text-xl">
                    {type === 'city' ? 'location_city' : 'place'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-black text-slate-900 dark:text-white truncate group-hover/item:text-sky-600 dark:group-hover/item:text-sky-400 transition-colors">
                    {suggestion.name}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] truncate">
                    {suggestion.state ? `${suggestion.state}, ` : ''}{suggestion.country}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="absolute right-4 top-[42px] flex items-center justify-center">
            <div className="size-4 border-2 border-sky-400/30 border-t-sky-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
