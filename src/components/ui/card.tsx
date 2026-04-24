import React from 'react'

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
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
