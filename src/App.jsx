import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './LandingPage'
import DashboardLayout from './DashboardLayout'

const App = () => {
  return (
    <div className='flex items-center justify-center'>
      <Router>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/dashboard/*' element={<DashboardLayout />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
