import React from 'react'

export function Progress({ value = 0, className = '' }: any) {
  return (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-muted ${className}`}>
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
