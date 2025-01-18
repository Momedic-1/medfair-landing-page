import React from 'react'
import { Routes, Route,useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Search from "./pages/Search"
const DashboardLayout = () => {

  return (
    <div className=''>
      <Sidebar />
      <div className='flex-1 overflow-auto p-0 lg:ml-24 xl:ml-12 bg-gray-100'>
     
        <Routes>
          <Route path='/' element={<Dashboard />} />
          {/* Uncomment and add other routes */}
          {/* <Route path="/dashboard/profile" element={<Profile />} /> */}
          {/* <Route path="/dashboard/messages" element={<Messages />} /> */}
          <Route path='/notes' element={<Search/>}/>
          
          
        </Routes>
      </div>
    </div>
  )
}

export default DashboardLayout
