import React from 'react'

export function Label({
  children,
  htmlFor,
  className,
  style
}: {
  children: React.ReactNode
  htmlFor?: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={className}
      style={{
        display: 'block',
        marginBottom: '0.25rem',
        fontWeight: 500,
        ...style
      }}
    >
      {children}
    </label>
  )
}
