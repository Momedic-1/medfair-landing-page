
import { NavLink } from 'react-router-dom';
import calendar from './assets/calendar.svg';
import dashboard from './assets/dashboard.svg';
import documents from './assets/documents.svg';
import help from './assets/help-circle.svg';
import message from './assets/message (2).svg';
import profile from './assets/profile (2).svg';
import subscription from './assets/subscription.svg';

function Sidebar({ isSidebarOpen, toggleSidebar }) {
  return (
    <aside
      className={`fixed lg:static top-0 left-0 h-full bg-[#020E7C] text-white flex flex-col lg:w-1/5 w-2/3 z-20 transform transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
    >
     
      <div className="p-4 text-2xl font-bold flex justify-between items-center">
        <span>Patient Dashboard</span>
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
        <NavLink to="/subscription" className="flex items-center p-3 m-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]" onClick={toggleSidebar}>
          <img src={subscription} alt="Subscription" /> <span className='ml-3 '>Subscriptions</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
