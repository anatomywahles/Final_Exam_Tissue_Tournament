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

export function CardHeader({
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
        marginBottom: '1rem',
        ...style
      }}
    >
      {children}
    </div>
  )
}

export function CardTitle({
  children,
  className,
  style
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <h2
      className={className}
      style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        margin: 0,
        ...style
      }}
    >
      {children}
    </h2>
  )
}

export function CardContent({
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
        marginTop: '1rem',
        ...style
      }}
    >
      {children}
    </div>
  )
}
