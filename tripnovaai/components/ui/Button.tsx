import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95'
    
    const variants = {
      primary: 'bg-primary text-white hover:opacity-90 shadow-premium',
      secondary: 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700',
      outline: 'border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200',
      ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
    }
    
    const sizes = {
      sm: 'px-4 py-2 text-xs uppercase tracking-widest',
      md: 'px-6 py-3 text-sm',
      lg: 'px-10 py-5 text-lg rounded-3xl',
    }

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <div className="size-4 pointer-events-none animate-spin border-2 border-white/30 border-t-white rounded-full mr-2" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
