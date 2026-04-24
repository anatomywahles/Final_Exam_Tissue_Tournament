import React from 'react'
import { Link } from 'react-router-dom'

export default function SummaryPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Summary</h1>
      <p>Your tissue tournament summary will appear here.</p>
      <Link to="/">Back to Home</Link>
    </div>
  )
}
