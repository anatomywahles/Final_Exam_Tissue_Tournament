import React from 'react'

export function Button({
  className = '',
  children,
  variant = 'default',
  ...props
}: any) {
  const variants: Record<string, string> = {
    default:
      'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline:
      'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
  }

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
