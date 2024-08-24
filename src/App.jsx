import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import DashboardLayout from './DashboardLayout'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/dashboard/*' element={<DashboardLayout />} />
      </Routes>
    </Router>
  )
}

export default App
