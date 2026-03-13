'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import Button from '@/components/ui/Button'

import { useLanguage } from '@/lib/i18n'

export default function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navLinks = [
    { href: '/', label: t('nav_explore') },
    { href: '/discover', label: t('nav_discover') },
    { href: '/saved', label: t('nav_my_trips') },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="container mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {mounted && theme === 'dark' ? (
            <img 
              src="/images/LogoWT.png" 
              alt="TripNovaAI" 
              className="h-32 w-auto transition-transform hover:scale-105"
            />
          ) : (
            <img 
              src="/images/LogoCT.png" 
              alt="TripNovaAI" 
              className="h-32 w-auto transition-transform hover:scale-105"
            />
          )}
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-lg font-bold transition-colors ${
                pathname === link.href
                  ? 'text-primary underline underline-offset-8 decoration-4'
                  : 'hover:text-primary text-slate-600 dark:text-slate-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setLanguage('es')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                language === 'es' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              ES
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                language === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined">
              {mounted && theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="ghost" size="sm">
              {t('btn_login')}
            </Button>
            <Button variant="primary" size="sm">
              {t('btn_signup')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
