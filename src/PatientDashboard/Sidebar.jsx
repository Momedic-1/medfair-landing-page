import { NavLink} from 'react-router-dom';
import calendar from './assets/calendar.svg'
import dashboard from './assets/dashboard.svg'
import documents from './assets/documents.svg'
import help from './assets/help-circle.svg'
import message from './assets/message (2).svg'
import profile from './assets/profile (2).svg'
import subscription from './assets/subscription.svg'
import { useState } from 'react';

    function Sidebar ({isSidebarOpen,toggleSidebar}){
  
        return<>
          <aside
        className={`fixed lg:static top-0 left-0 h-full bg-[#020E7C] text-white flex flex-col lg:w-1/5 w-2/3 z-20 transform transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-4  text-2xl font-bold flex justify-between items-center">
          <span>Patient Dashboard</span>
        </div>
        <nav className="flex flex-col p-4">
          <NavLink to="/patient-dashboard" className="flex items-center p-3 m-3 py-2 px-4 rounded bg-white hover:text-[#020E7C]" onClick={toggleSidebar}>
            <img src={dashboard}/> <span className='ml-3 text-black'>Dashboard</span>
          </NavLink>
          <NavLink to="/patient_profile" className=" flex items-center p-3 m-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]" onClick={toggleSidebar}>
            <img src={profile}/> <span className='ml-3'>View Profile</span>
          </NavLink>
          <NavLink to="/appointments" className=" flex items-center p-3 m-3  py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]" onClick={toggleSidebar}>
            <img src={calendar}/> <span className='ml-3'>Appointments</span>
          </NavLink>
          <NavLink to="/settings" className=" flex items-center p-3 m-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]" onClick={toggleSidebar}>
            <img src={message}/> <span className='ml-3'>Messages</span>
          </NavLink>
          <NavLink to="/settings" className=" flex items-center p-3 m-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]" onClick={toggleSidebar}>
            <img src={documents}/> <span className='ml-3'>Check Previous History</span>
          </NavLink>

          <NavLink to="/settings" className="flex items-center p-3 m-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]" onClick={toggleSidebar}>
           <img src={subscription}/> <span className='ml-3'>Subscription</span>
          </NavLink>

          <NavLink to="/settings" className="flex items-center p-3 m-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]" onClick={toggleSidebar}>
            <img src={help}/> <span className='ml-3'>Help</span>
          </NavLink>

          <NavLink to="/settings" className="flex items-center mt-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]" onClick={toggleSidebar}>
            <img src={dashboard}/> <span className='ml-3'>Logout</span>
          </NavLink>
        </nav>
      </aside>
</>
    }

export default Sidebar;