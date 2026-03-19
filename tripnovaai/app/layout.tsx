import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'TripNovaAI - AI Powered Travel Planning',
  description: 'Your personal AI concierge for crafting unforgettable journeys. No more endless searching, just pure exploration.',
  keywords: 'AI travel planner, itinerary generator, trip planning, AI travel assistant',
  openGraph: {
    title: 'TripNovaAI - AI Powered Travel Planning',
    description: 'Your personal AI concierge for crafting unforgettable journeys.',
    type: 'website',
  },
}

import { LanguageProvider } from '@/lib/i18n'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background-light dark:bg-background-dark font-display text-slate-100 transition-colors duration-300 min-h-screen flex flex-col">
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
