import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full group/field">
        {label && (
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-slate-400 dark:text-slate-500 px-1 group-focus-within/field:text-sky-500 transition-colors">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 transition-colors group-focus-within/field:text-sky-500">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800
              bg-white dark:bg-slate-900 text-slate-900 dark:text-white 
              placeholder:text-slate-300 dark:placeholder:text-slate-700
              focus:ring-0 focus:border-sky-400/50 dark:focus:border-sky-900/50
              hover:border-slate-200 dark:hover:border-slate-700
              transition-all duration-300 font-bold text-sm
              ${icon ? 'pl-14' : 'px-5'} 
              ${error ? 'border-red-500 dark:border-red-900/50' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-red-500 text-[10px] font-bold mt-2 px-1 uppercase tracking-widest">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
