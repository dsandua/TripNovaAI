import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'outline'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-white/20 shadow-premium text-slate-900 dark:text-white backdrop-blur-2xl',
      hover: 'bg-white/80 dark:bg-slate-800/80 border border-slate-100 dark:border-white/20 hover:shadow-premium-hover transition-all cursor-pointer shadow-premium hover:-translate-y-0.5 text-slate-900 dark:text-white backdrop-blur-2xl',
      outline: 'bg-transparent border-2 border-slate-100 dark:border-slate-800',
    }

    return (
      <div
        ref={ref}
        className={`rounded-xl text-slate-900 ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
