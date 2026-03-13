'use client'

import { useState } from 'react'

interface DayTabsProps {
  days: number[]
  destination: string
  activeDay: number
  onDayChange: (day: number) => void
}

export default function DayTabs({ days, destination, activeDay, onDayChange }: DayTabsProps) {
  return (
    <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 pt-4 border-b border-slate-100 dark:border-slate-800">
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => onDayChange(day)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeDay === day
                ? 'bg-primary text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Day {day}: {destination}
          </button>
        ))}
      </div>
    </div>
  )
}
