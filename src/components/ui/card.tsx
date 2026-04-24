import React from 'react'

export function Card({
  children,
  className,
  style
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={className}
      style={{
        background: 'white',
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        ...style
      }}
    >
      {children}
    </div>
  )
}
