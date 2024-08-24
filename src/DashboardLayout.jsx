import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
// Uncomment and import other components as needed
// import Profile from './components/Profile';
// import Messages from './components/Messages';

const DashboardLayout = () => {
  return (
    <div className=''>
      <Sidebar />
      <div className='flex-1 overflow-auto p-8 bg-gray-100'>
        <Routes>
          <Route path='/' element={<Dashboard />} />
          {/* Uncomment and add other routes */}
          {/* <Route path="/dashboard/profile" element={<Profile />} /> */}
          {/* <Route path="/dashboard/messages" element={<Messages />} /> */}
        </Routes>
      </div>
    </div>
  )
}

export default DashboardLayout
