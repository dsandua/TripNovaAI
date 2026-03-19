'use client'

import React from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '@/lib/i18n'

interface LoadingOverlayProps {
  isOpen: boolean
  message?: string
  onCancel?: () => void
}

export default function LoadingOverlay({ isOpen, message = 'Estamos diseñando tu viaje perfecto...', onCancel }: LoadingOverlayProps) {
  const { t } = useLanguage()
  const [mounted, setMounted] = React.useState(false)
  const [currentMessage, setCurrentMessage] = React.useState(0)

  const messages = [
    t('loading_expert') || 'Consultando expertos locales...',
    t('loading_gems') || 'Buscando los mejores rincones...',
    t('loading_routes') || 'Calculando rutas óptimas...',
    t('loading_curating') || 'Personalizando tu experiencia...',
    t('loading_finalizing') || 'Casi listo, afinando detalles...'
  ]

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!isOpen) { 
      setCurrentMessage(0)
      return 
    }
    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [isOpen, messages.length])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed top-0 left-0 w-[100vw] h-[100vh] z-[10000] flex items-center justify-center p-4 md:p-10 text-center overflow-hidden bg-slate-950">
      {/* Background with multiple gradient layers for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#0c4a6e,transparent)] opacity-60 w-full h-full" />
      
      <div className="relative max-w-xl w-full space-y-12 animate-in zoom-in-95 duration-1000 ease-out z-10">
        <div className="relative mx-auto size-56 flex items-center justify-center">
          {/* Animated rings - restored and made prominent */}
          <div className="absolute inset-0 border-2 border-slate-800 rounded-full" />
          <div className="absolute inset-0 border-t-4 border-sky-400 rounded-full animate-[spin_3s_linear_infinite]" />
          <div className="absolute inset-6 border-r-4 border-indigo-500/50 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
          <div className="absolute inset-12 border-b-4 border-rose-400/30 rounded-full animate-[spin_4s_linear_infinite]" />
          
          {/* Central glow */}
          <div className="absolute inset-16 bg-sky-500/20 rounded-full blur-3xl animate-pulse" />
          
          {/* Floating icon with double animation */}
          <div className="animate-[bounce_2s_infinite]">
            <span className="material-symbols-outlined text-7xl text-white [text-shadow:0_0_30px_rgba(56,189,248,0.6)]">
              flight_takeoff
            </span>
          </div>
        </div>

        <div className="space-y-8">
          <div className="min-h-[80px] flex flex-col justify-center px-4">
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-tight animate-in fade-in slide-in-from-bottom-2 duration-700" key={currentMessage}>
              {messages[currentMessage]}
            </h2>
          </div>
          
          {/* Premium Progress Bar */}
          <div className="space-y-4 max-w-xs mx-auto">
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex items-center p-1">
              <div className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-sky-400 bg-[length:200%_100%] rounded-full animate-[loading-progress_20s_ease-in-out_forwards,loading-shimmer_2s_linear_infinite]" />
            </div>
            <div className="flex justify-between px-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('loading_status') || 'Analizando'}</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">v1.2</span>
            </div>
          </div>

          <div className="pt-8">
            {onCancel && (
              <button 
                onClick={onCancel}
                className="px-8 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 transition-all font-black text-[10px] uppercase tracking-[0.2em] border border-white/5 hover:border-white/10 active:scale-95 flex items-center gap-3 mx-auto"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                {t('cancel') || 'Cancelar'}
              </button>
            )}
          </div>

          <p className="text-slate-600 font-black uppercase text-[10px] tracking-[0.6em] pt-4">
            TripNova AI Concierge
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}
