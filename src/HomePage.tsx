import React from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Tissue Tournament</h1>
      <p>Welcome! Start your bracket below.</p>
      <Link to="/bracket">Go to Bracket</Link>
    </div>
  )
}
