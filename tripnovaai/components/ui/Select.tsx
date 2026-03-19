import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, ...props }, ref) => {
    return (
      <div className="w-full group/field">
        {label && (
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-slate-400 dark:text-slate-500 px-1 group-focus-within/field:text-sky-500 transition-colors">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800
              bg-white dark:bg-slate-900 text-slate-900 dark:text-white 
              focus:ring-0 focus:border-sky-400/50 dark:focus:border-sky-900/50
              hover:border-slate-200 dark:hover:border-slate-700
              transition-all duration-300 font-bold text-sm px-5 appearance-none
              ${error ? 'border-red-500 dark:border-red-900/50' : ''}
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 transition-colors group-focus-within/field:text-sky-500">
            <span className="material-symbols-outlined text-xl">expand_more</span>
          </div>
        </div>
        {error && <p className="text-red-500 text-[10px] font-bold mt-2 px-1 uppercase tracking-widest">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
