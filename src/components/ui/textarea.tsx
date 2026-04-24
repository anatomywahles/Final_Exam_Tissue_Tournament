import React from 'react'

export function Textarea({
  value,
  onChange,
  placeholder,
  className,
  style,
  rows = 4
}: {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  className?: string
  style?: React.CSSProperties
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={className}
      style={{
        width: '100%',
        padding: '0.5rem',
        borderRadius: '6px',
        border: '1px solid #ccc',
        fontSize: '1rem',
        ...style
      }}
    />
  )
}
