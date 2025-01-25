
import { NavLink } from 'react-router-dom';
import calendar from './assets/calendar.svg';
import dashboard from './assets/dashboard.svg';
import documents from './assets/documents.svg';
import help from './assets/help-circle.svg';
import message from './assets/message (2).svg';
import profile from './assets/profile (2).svg';
import subscription from './assets/subscription.svg';
import { FaUser } from "react-icons/fa";
import Logout from '../Logout';
import CloseIcon from '../assets/CloseIcon';
import DashboardIcon from '../assets/DashboardIcon';
import { CalendarIcon } from 'lucide-react';
import DocumentsIcon from '../assets/DocumentIcon';
import MessagesIcon from '../assets/MessageIcon';
import AudioCallIcon from '../assets/AudioCallIcon';
import VideoCallIcon from '../assets/VideoCallIcon';
import FinanceIcon from '../assets/FinanceIcon';
import SettingsIcon from '../assets/SettingsIcon';
import HelpIcon from '../assets/HelpIcon';

function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const userData = JSON.parse(localStorage.getItem('userData'));
  const role = userData?.role;
  return (
    <div
      className={`fixed lg:static w-full top-0 left-0 h-full bg-[#020E7C] text-white flex flex-col z-20 transform transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
    >
     {role === "PATIENT" ? <div className='w-full'>

      <div className="w-full p-4 text-2xl font-bold flex justify-between items-center">
        <p>Patient Dashboard</p>
        <button
           onClick={toggleSidebar}
          className="lg:hidden text-white text-2xl focus:outline-none"
         >
           ✕
        </button>
      </div>
      
      <nav className="flex flex-col p-4">
        <NavLink to="/patient-dashboard" className="flex items-center p-3 m-3 py-2 px-4 rounded bg-white hover:text-[#020E7C]" onClick={toggleSidebar}>
            <img src={dashboard}/> <span className='ml-3 text-black'>Dashboard</span>
          </NavLink>
          
           <NavLink to="/patient_profile" className=" flex items-center p-3 m-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]" onClick={toggleSidebar}>
             <img src={profile}/> <span className='ml-3'>View Profile</span>
           </NavLink>
         <NavLink to="/calendar" className="flex items-center p-3 m-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]" onClick={toggleSidebar}>
          <img src={calendar} alt="Calendar" /> <span className='ml-3 '>Calendar</span>
        </NavLink>
        <NavLink to="/message" className="flex items-center p-3 m-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]" onClick={toggleSidebar}>
          <img src={message} alt="Message" /> <span className='ml-3 '>Messages</span>
        </NavLink>
        <NavLink to="/documents" className="flex items-center p-3 m-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]" onClick={toggleSidebar}>
          <img src={documents} alt="Documents" /> <span className='ml-3 '>Documents</span>
        </NavLink>
        <NavLink to="/help" className="flex items-center p-3 m-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]" onClick={toggleSidebar}>
          <img src={help} alt="Help" /> <span className='ml-3 '>Help</span>
        </NavLink>
        <NavLink to="/patient-dashboard/subscription" className="flex items-center p-3 m-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]" onClick={toggleSidebar}>
          <img src={subscription} alt="Subscription" /> <span className='ml-3 '>Subscriptions</span>
        </NavLink>
        <NavLink to="/patient-dashboard/patient-notes" className="flex items-center p-3 m-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]" onClick={toggleSidebar}>
          <FaUser /> 
           <span className='ml-3 '>Notes</span>
        </NavLink>
        <NavLink className="flex items-center p-3 m-3 py-2 px-2 rounded hover:bg-white hover:text-[#020E7C]" >
          <Logout/>
        </NavLink>
      </nav>
     </div>
     
    : (
        <div className='relative flex flex-col h-full max-h-full'>
          <div className='px-6 pt-4 flex justify-between items-center'>
            <a
              className='flex items-center space-x-2 flex-none rounded-md text-sm font-semibold focus:outline-none focus:opacity-80'
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
                    to='notes'
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
    )}
    </div>
  );
}

export default Sidebar;
