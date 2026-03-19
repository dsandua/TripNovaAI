'use client'

import { useLanguage } from '@/lib/i18n'

interface BudgetPanelProps {
  budget: {
    total: number
    activities: number
    food: number
    transport: number
    currency: string
  }
  variant?: 'vertical' | 'horizontal'
}

export default function BudgetPanel({ budget, variant = 'vertical' }: BudgetPanelProps) {
  const { t } = useLanguage()

  const categories = [
    { 
      label: t('budget_activities'), 
      amount: budget.activities, 
      icon: 'local_activity',
      color: 'bg-soft-sky text-sky-600 border-sky-100/50',
      darkColor: 'dark:bg-sky-900/10 dark:text-sky-400 dark:border-sky-900/30'
    },
    { 
      label: t('budget_food'), 
      amount: budget.food, 
      icon: 'restaurant',
      color: 'bg-soft-peach text-orange-600 border-orange-100/50',
      darkColor: 'dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-900/30'
    },
    { 
      label: t('budget_transport'), 
      amount: budget.transport, 
      icon: 'directions_car',
      color: 'bg-soft-mint text-emerald-600 border-emerald-100/50',
      darkColor: 'dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/30'
    },
  ]

  if (variant === 'horizontal') {
    return (
      <div className="h-full w-full bg-[#fafafc] dark:bg-slate-950 p-6 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-6">
            {/* Main Total Card - Glassmorphism Premium */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white dark:border-white/20 shadow-premium flex items-center gap-6 group hover:scale-[1.02] transition-all duration-700 min-w-[320px]">
              <div className="size-16 rounded-3xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-sky-200/50 dark:shadow-none transition-transform duration-700 group-hover:rotate-12">
                <span className="material-symbols-outlined text-3xl filled-icon">account_balance_wallet</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{t('budget_estimated_total')}</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {budget.total}<span className="text-xl ml-1 text-sky-500 opacity-80">{budget.currency}</span>
                </p>
              </div>
            </div>

            {/* Category Cards - Pastel Grid */}
            <div className="flex-1 grid grid-cols-3 gap-5">
              {categories.map((cat, i) => (
                <div 
                  key={i} 
                  className={`p-5 rounded-[2.2rem] border-2 transition-all duration-700 hover:shadow-premium group ${cat.color} ${cat.darkColor}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-2xl bg-white/60 dark:bg-slate-800/40 flex items-center justify-center shadow-sm backdrop-blur-sm group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1 truncate">{cat.label}</p>
                      <p className="text-xl font-black tracking-tight truncate">
                        {cat.amount}<span className="text-xs ml-0.5 opacity-60">{budget.currency}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-[3rem] p-10 border border-slate-100 dark:border-white/20 shadow-premium">
      <div className="flex items-center gap-5 mb-10">
        <div className="size-14 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-200 dark:shadow-none">
          <span className="material-symbols-outlined text-2xl">payments</span>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{t('budget_estimation')}</h2>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500">{t('budget_based_on_items')}</p>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((cat, i) => (
          <div key={i} className={`p-6 rounded-[2rem] border-2 transition-all hover:scale-[1.02] ${cat.color} ${cat.darkColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined opacity-70">{cat.icon}</span>
                <span className="font-black text-sm uppercase tracking-widest opacity-80">{cat.label}</span>
              </div>
              <span className="text-xl font-black tracking-tighter">
                {cat.amount} {budget.currency}
              </span>
            </div>
          </div>
        ))}

        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between p-8 bg-slate-900 dark:bg-white rounded-[2.5rem] text-white dark:text-slate-900 shadow-premium">
            <span className="font-black text-sm uppercase tracking-[0.2em] opacity-60">{t('budget_total')}</span>
            <span className="text-4xl font-black tracking-tighter">
              {budget.total} {budget.currency}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
