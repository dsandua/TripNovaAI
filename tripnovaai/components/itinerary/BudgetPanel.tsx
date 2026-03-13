import Button from '@/components/ui/Button'

interface BudgetItem {
  label: string
  icon: string
  cost: number
}

interface BudgetPanelProps {
  items: BudgetItem[]
  total: number
  budgetLevel?: 'low' | 'moderate' | 'high'
}

export default function BudgetPanel({ items, total, budgetLevel = 'moderate' }: BudgetPanelProps) {
  const levelColors = {
    low: 'bg-green-100 text-green-600',
    moderate: 'bg-yellow-100 text-yellow-600',
    high: 'bg-red-100 text-red-600',
  }

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
          Budget Estimation
        </h3>
        <span className={`text-xs font-bold px-2 py-1 rounded ${levelColors[budgetLevel]}`}>
          {budgetLevel.charAt(0).toUpperCase() + budgetLevel.slice(1)}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <span className="font-semibold text-sm">€{item.cost.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-end">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated Total</p>
          <p className="text-2xl font-bold text-primary">€{total.toLocaleString()}</p>
        </div>
        <Button size="sm">
          Reserve All
        </Button>
      </div>
    </div>
  )
}
