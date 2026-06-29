'use client'
import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={[
            'w-full rounded-md border bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/50',
            'focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest/50',
            'disabled:bg-mist disabled:text-ink-muted',
            'transition-colors',
            error
              ? 'border-danger/40 focus:ring-danger/20 focus:border-danger/40'
              : 'border-rule',
            className,
          ].join(' ')}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'
