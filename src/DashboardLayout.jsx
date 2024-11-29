import React from 'react'
import { Routes, Route,useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Search from "./pages/Search"
const DashboardLayout = () => {
  const location = useLocation();
  const isSearchPage = location.pathname === '/doctor-dashboard/search';

  return (
    <div className=''>
      <Sidebar />
      <div className='flex-1 overflow-auto p-8 bg-gray-100'>
      {!isSearchPage && (
          <header className="sticky top-0 inset-x-0 bg-white border-b p-4">
     
            <h1 className="text-xl font-bold">Dashboard Header</h1>
          </header>
        )}
        <Routes>
          <Route path='/' element={<Dashboard />} />
          {/* Uncomment and add other routes */}
          {/* <Route path="/dashboard/profile" element={<Profile />} /> */}
          {/* <Route path="/dashboard/messages" element={<Messages />} /> */}
          <Route path='/search' element={<Search/>}/>
          
        </Routes>
      </div>
    </div>
  )
}

export default DashboardLayout
