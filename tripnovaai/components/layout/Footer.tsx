'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'

import { useLanguage } from '@/lib/i18n'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const { theme } = useTheme()
  const { t } = useLanguage()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Do not show footer on itinerary page as it interferes with the map/sidebar layout
  if (pathname?.startsWith('/itinerary')) return null;

  return (
    <footer className="bg-background-light dark:bg-slate-950 border-t border-slate-200/20 dark:border-slate-900 py-6">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            {mounted && theme === 'dark' ? (
            <img 
              src="/images/LogoWT.png" 
              alt="TripNovaAI" 
              className="h-28 w-auto grayscale-0 opacity-100 transition-all hover:scale-105"
            />
            ) : (
            <img 
              src="/images/LogoCT.png" 
              alt="TripNovaAI" 
              className="h-28 w-auto grayscale-0 opacity-100 transition-all hover:scale-105"
            />
            )}
          </div>

          <div className="flex gap-8 text-sm text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em]">
            <Link href="/discover" className="hover:text-primary transition-colors">{t('nav_discover')}</Link>
            <Link href="/" className="hover:text-primary transition-colors">{t('nav_explore')}</Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-900 text-center text-xs text-slate-400">
          © {mounted ? new Date().getFullYear() : '2026'} TripNovaAI Inc. {t('footer_rights')} {t('footer_built_with')}
        </div>
      </div>
    </footer>
  )
}
