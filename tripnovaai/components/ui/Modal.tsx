'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10 pointer-events-none">
      <div 
        className="absolute inset-0 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10 pointer-events-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
