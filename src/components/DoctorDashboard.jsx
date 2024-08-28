import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom'
import Dashboard from './Dashboard'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Navigate to='/dashboard' replace />} />
        <Route path='/dashboard/*' element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
