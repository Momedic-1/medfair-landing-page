import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import bell from './assets/bell.svg'
import calendar from './assets/calendar.svg'
import dashboard from './assets/dashboard.svg'
import documents from './assets/documents.svg'
import help from './assets/help-circle.svg'
import logout from './assets/logout (2).svg'
import message from './assets/message (2).svg'
import profile from './assets/profile (2).svg'
import setting from './assets/setting.svg'
import subscription from './assets/subscription.svg'
import profile_img from './assets/profile-img.svg'


export default function Profile() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
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
            <img src={dashboard}/> <span className='ml-3'>Dashboard</span>
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top Navigation */}
        <header className="w-full p-4 bg-gray-100 flex justify-between items-center shadow">
          {/* Menu icon for mobile */}
           
          <div className="flex-1 mr-4">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search..."
              className="w-full p-3 rounded-lg border  focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-blue-800 font-semibold">John Doe</span>
            <img src={bell} alt='notifications' className='hidden lg:block'/>
            <img src={bell} alt='notifications' className='block lg:hidden' onClick={toggleSidebar}/>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
            <div className='flex flex-col items-center'>
                <h1 className='text-2xl text-[#020E7C] p-2 m-2'>Profile</h1>
                <img src={profile_img} alt=''/>

            </div>


        </main>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}
