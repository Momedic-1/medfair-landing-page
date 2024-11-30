import React, { useState, useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import MagnifyingGlass from "../assets/MagnifyingGlass.jsx";
import NotificationBell from "../assets/NotificationBell.jsx";
import CalendarIcon from '../assets/Calendar.jsx';
import MessagesIcon from '../assets/MessageIcon.jsx';
import DashboardIcon from '../assets/DashboardIcon.jsx';
import AudioCallIcon from '../assets/AudioCallIcon.jsx';
import VideoCallIcon from '../assets/VideoCallIcon.jsx';
import DocumentsIcon from '../assets/DocumentIcon.jsx';
import FinanceIcon from '../assets/FinanceIcon.jsx';
import SettingsIcon from '../assets/SettingsIcon.jsx';
import { FaUser } from "react-icons/fa";
import HelpIcon from '../assets/HelpIcon.jsx';
import CloseIcon from '../assets/CloseIcon.jsx';
import Logout from '../Logout.jsx';

const Sidebar = () => {
 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const sidebarRef = useRef(null)
  const userData = JSON.parse(localStorage.getItem('userData'));

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = event => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeSidebar()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  return (
    <>
        
      <header className='sticky top-0 inset-x-0 px-2 flex flex-wrap md:justify-start md:flex-nowrap z-[48] w-full bg-white border-b text-sm py-2.5 lg:ps-[260px] overflow-x-hidden'>
          <nav className='px-4 sm:px-6 flex basis-full items-center w-full mx-auto flex-col'>
         <div className='flex items-center px-4 justify-between w-full md:hidden'>
         <button
        onClick={toggleSidebar}
        className="text-2xl mr-4  mb-20 text-blue-800 focus:outline-none"
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>
         <div className='relative flex-grow w-[10rem] mr-2'>
        <div className='absolute inset-y-0 left-0 flex items-center pointer-events-none ps-3.5'>
          <MagnifyingGlass/>
        </div>
        <input
          type='text'
          className='py-4 pl-10 pr-8 w-[9rem] bg-white border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none'
          placeholder='Search anything'
        />
      </div>
      <button className='bg-blue-800 text-white py-2 w-[8rem] px-4 rounded-lg font-bold sm:px-4 sm:py-3 sm:text-sm'>
        Create appointment
      </button>
    </div>
    <div className='hidden md:flex md:flex-row items-center justify-between gap-1 md:gap-x-3 w-full'>
      <div className='relative w-[40rem]'>
        <div className='absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-3.5'>
          <MagnifyingGlass/>
        </div>
        <input
          type='text'
          className='py-4 ps-10 pe-16 block w-[34rem] bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none'
          placeholder='Search anything'
        />
      </div>

      <span className="font-bold text-[#020E7C]">
        {userData
          ? userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1).toLowerCase()
          : null}
      </span>
      <button
        type='button'
        className='size-[38px] relative inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none'
      >
        <NotificationBell/>
        <span className='sr-only'>Notifications</span>
      </button>
      <button className='bg-blue-800 text-white py-4 w-32 h-16 pe-16 font-bold sm:px-4 sm:py-4 rounded-2xl sm:text-sm px-2'>
        Create appointment
      </button>
    </div>
  </nav>
</header>

      {isSidebarOpen && (
        <div
          className='fixed inset-0 bg-gray-900 bg-opacity-50 z-[59] lg:hidden'
          onClick={closeSidebar}> </div> )}
      <div
        ref={sidebarRef}
        id='hs-application-sidebar'
        className={`hs-overlay ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-all duration-300 transform fixed inset-y-0 start-0 z-[60] w-[260px] bg-[#020e7c] border-e border-gray-200 lg:block lg:translate-x-0 lg:end-auto lg:bottom-0`}
        role='dialog'
        tabIndex='-1'
        aria-label='Sidebar'
      >
        <div className='relative flex flex-col h-full max-h-full'>
          <div className='px-6 pt-4 flex justify-between items-center'>
            <a
              className='flex items-center space-x-2 flex-none rounded-md text-sm inline-block font-semibold focus:outline-none focus:opacity-80'
              href='#'
              aria-label='Dashboard'
            >
              <span className='text-white'>Doctor's Dashboard</span>
            </a>
            <button
                onClick={toggleSidebar}
               className="lg:hidden mr-4 mb-20 text-white text-2xl focus:outline-none"
            >
             <CloseIcon/>
            </button>
          </div>

          <div className='h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300'>
            <nav
              className='hs-accordion-group p-3 w-full flex flex-col flex-wrap'
              data-hs-accordion-always-open
            >
              <ul className='flex flex-col space-y-1 mt-6'>
                <li className='mb-2'>
                  <NavLink
                    to='/doctor-dashboard'
                    className={({ isActive }) =>
                      `flex items-center p-2 rounded-lg ${
                        isActive
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-gray-100 hover:bg-gray-100'
                      }`
                    }
                  >
                    <DashboardIcon/>
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <a
                    className='w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-100 rounded-lg hover:bg-gray-100 hover:text-blue-600'
                    href='#'
                  >
                   <CalendarIcon/>
                    View Profile
                  </a>
                </li>
                <li>
                  <a
                    className='w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-100 rounded-lg hover:bg-gray-100 hover:text-blue-600'
                    href='#'
                  >
                   <MessagesIcon/>
                    Messages
                  </a>
                </li>
                <li>
                  <a
                    className='w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-100 rounded-lg hover:bg-gray-100 hover:text-blue-600'
                    href='#'
                  >
                   <AudioCallIcon/>
                    Audio calls
                  </a>
                </li>
                <li>
                  <a
                    className='w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-100 rounded-lg hover:bg-gray-100 hover:text-blue-600'
                    href='#'
                  >
                   <VideoCallIcon/>
                    Video calls
                  </a>
                </li>
                <li>
                  <a
                    className='w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-100 rounded-lg hover:bg-gray-100 hover:text-blue-600'
                    href='#'
                  >
                   <DocumentsIcon/>
                    Documents
                  </a>
                </li>
                <li>
                  <a
                    className='w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-100 rounded-lg hover:bg-gray-100 hover:text-blue-600'
                    href='#'
                  >
                    <FinanceIcon/>
                    Finances
                  </a>
                </li>
                <li>
                  <a
                    className='w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-100 rounded-lg hover:bg-gray-100 hover:text-blue-600'
                    href='#'
                  >
                   <SettingsIcon/>
                    Settings
                  </a>
                </li>
                <li>
                  <a
                    className='w-full flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-100 rounded-lg hover:bg-gray-100 hover:text-blue-600'
                    href='#'
                  >
                    <HelpIcon/>
                    Help
                  </a>
                </li>
                <li>
                
                <NavLink
                    to='search'
                    className={({ isActive }) =>
                      `flex items-center gap-x-3.5 py-2 px-2.5 rounded-lg ${
                        isActive
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-gray-100 hover:bg-gray-100'
                      }`
                    }
                  >
                  <FaUser /> 
                  Notes
                  </NavLink>
</li>

                <li>
                  
                    <Logout/>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}
export default Sidebar

