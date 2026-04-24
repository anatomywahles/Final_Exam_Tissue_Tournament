import React from 'react'

export function Button({
  children,
  onClick,
  className,
  style,
  type = 'button'
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
  type?: 'button' | 'submit' | 'reset'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={className}
      style={{
        padding: '0.5rem 1rem',
        background: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '1rem',
        ...style
      }}
    >
      {children}
    </button>
  )
}
