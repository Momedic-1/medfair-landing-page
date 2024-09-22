import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
import doctor from './assets/doctor.svg'
import banner from './assets/banner.svg'
import call from './assets/call (2).svg'
import lab from './assets/lab.svg'
import specialist from './assets/specialist.svg'
import book from './assets/book (2).svg'


export default function Dashboard() {
  const navigate = useNavigate()
     const token = localStorage.getItem('authToken');
  const userData = JSON.parse(localStorage.getItem('userData'));

  // Check if user data and token exist
  if (!token || !userData) {
    // Redirect to login page if no valid data is found
    navigate('/login');
    return null;
  }


  async function  handleCall(){
  const userDataString = localStorage.getItem('userData');

  const userData = JSON.parse(userDataString);
  const patientId = userData?.id
 
    try {
      const response = await fetch('https://momedic.onrender.com/api/call/initiate?'+patientId, {
        method: 'POST',
        headers: {
         'Content-Type': 'application/json'
        },
      });


    } catch (error) {
      setLoading(false);
      setErrorMessage('Something went wrong. Try again!');
      console.error('Error verifying email:', error);
    }
  }

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
            <span className="text-blue-800 font-semibold">{userData ? userData.firstName : 'Doe'}</span>
            <img src={bell} alt='notifications' className='hidden lg:block'/>
            <img src={bell} alt='notifications' className='block lg:hidden' onClick={toggleSidebar}/>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
            
          <div className="relative w-full flex items-center">
           <img src={banner} alt="Banner" className="w-full h-auto" />
           <img 
    src={doctor} 
    alt="Doctor" 
    className="absolute left-0 ml-4 h-auto max-h-full" 
    style={{ bottom: '0', maxHeight: '80%' }} 
    />

        </div>


        <div className='quick-tools mt-8 flex flex-col lg:flex-row items-center justify-between'>
            <div className='call flex flex-col items-center'>
                <p className='text-[#020E7C] mb-2'>Call a doctor</p>
                <img onClick={handleCall} src={call} alt='call'/>
            </div>

            <div className='call flex flex-col items-center'>
                <p className='text-[#020E7C] mb-2'>Book an Appointment</p>
                <img src={book} alt='book'/>
            </div>

            <div className='call flex flex-col items-center'>
                <p className='text-[#020E7C] mb-2'>See a specialist</p>
                <img src={book} alt='lab'/>
            </div>

            <div className='call flex flex-col items-center'>
                <p className='text-[#020E7C] mb-2'>Book a lab test</p>
                <img src={book} alt='lab'/>
            </div>
        </div>


        <h1 className='text-2xl text-[#020E7C] p-3 mt-5 mb-2 font-semibold'>Choose a Plan</h1>



        <div className="quick-tools mt-10 p-3 flex lg:flex-row items-center justify-between">

  {/* Circular Div 2 */}
  <div className="flex flex-col items-center text-center m-3">
    <div className="w-24 h-24 flex flex-col items-center justify-center font-semibold text-blue-700 border border-blue-700 rounded-full mb-4">
      <span className='mb-2'>
        Instant
      </span>
      <span>
        N1500
      </span>
    </div>
    <p className="text-[#020E7C] mb-2">By clicking subscribe you can make instant calls to consult a Doctor which is valid for only 12hours.</p>
    <button className="bg-blue-700 text-white py-2 px-4 rounded" onClick={()=>navigate('/payment')}>Subscribe</button>
  </div>

  {/* Circular Div 3 */}
  <div className="flex flex-col items-center text-center m-3">
    <div className="w-24 h-24 flex flex-col items-center justify-center font-semibold bg-blue-700 text-white border border-blue-700 rounded-full mb-4">
      <span className='mb-2'>
        Monthly
      </span>
      <span>
        N5000
      </span>
    </div>
    <p className="text-[#020E7C] mb-2">By clicking subscribe you can make instant calls to consult a Doctor which is valid for only 1 month.</p>
    <button className="bg-blue-700 text-white py-2 px-4 rounded " onClick={()=>navigate('/payment')}>Subscribe</button>
  </div>

  {/* Circular Div 4 */}
  <div className="flex flex-col items-center text-center m-3">
    <div className="w-24 h-24 flex flex-col items-center justify-center font-semibold bg-white text-blue-700 border border-blue-700 rounded-full mb-4">
      <span className='mb-2'>
        Yearly
      </span>
      <span>
        N45000
      </span>
    </div>
    <p className="text-[#020E7C] mb-2">By clicking subscribe you can make instant calls to consult a Doctor which is valid for only 1 year.</p>
    <button className="bg-blue-700 text-white py-2 px-4 rounded" nClick={()=>navigate('/payment')}>Subscribe</button>
  </div>
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
