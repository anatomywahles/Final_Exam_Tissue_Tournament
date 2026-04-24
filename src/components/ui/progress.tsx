import React from 'react'

export function Progress({
  value = 0,
  max = 100,
  className,
  style
}: {
  value?: number
  max?: number
  className?: string
  style?: React.CSSProperties
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '10px',
        background: '#e5e7eb',
        borderRadius: '6px',
        overflow: 'hidden',
        ...style
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          background: '#2563eb',
          transition: 'width 0.3s ease'
        }}
      />
    </div>
  )
}
