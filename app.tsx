import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './HomePage'
import BracketPage from './BracketPage'
import SummaryPage from './SummaryPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bracket" element={<BracketPage />} />
        <Route path="/summary" element={<SummaryPage />} />
      </Routes>
    </BrowserRouter>
  )
}
