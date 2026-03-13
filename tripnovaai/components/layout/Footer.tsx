'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'

import { useLanguage } from '@/lib/i18n'

export default function Footer() {
  const { theme } = useTheme()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            {mounted && theme === 'dark' ? (
            <img 
              src="/images/LogoWT.png" 
              alt="TripNovaAI" 
              className="h-32 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all"
            />
            ) : (
            <img 
              src="/images/LogoCT.png" 
              alt="TripNovaAI" 
              className="h-32 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all"
            />
            )}
          </div>

          <div className="flex gap-8 text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
            <Link href="/discover" className="hover:text-primary transition-colors">{t('nav_discover')}</Link>
            <Link href="/saved" className="hover:text-primary transition-colors">{t('nav_my_trips')}</Link>
            <Link href="/help" className="hover:text-primary transition-colors">{t('footer_support')}</Link>
          </div>

          <div className="flex gap-4">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">public</span>
            </a>
            <a 
              href="mailto:hello@tripnovaai.com"
              className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">mail</span>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-900 text-center text-xs text-slate-400">
          © {mounted ? new Date().getFullYear() : '2024'} TripNovaAI Inc. {t('footer_rights')} {t('footer_built_with')}
        </div>
      </div>
    </footer>
  )
}
