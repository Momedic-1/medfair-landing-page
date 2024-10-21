
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bell from './assets/bell.svg';
import doctor from './assets/doctor.svg';
import banner from './assets/banner.svg';
import call from './assets/call (2).svg';
import book from './assets/book (2).svg';
import specialistIcon from './assets/specialis-icon.svg';
import { baseUrl } from '../env';
import SpecialistModal from '../PatientSignup/SpecialistModal';
import Sidebar from './Sidebar';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Dashboard() {
  const [specialistModal, setSpecialistModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const userData = JSON.parse(localStorage.getItem('userData'));

  if (!token || !userData) {
    navigate('/login');
    return null;
  }

  function makePaymentToast(message) {
    toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      rtl: false,
      progressStyle: {
        background: '#000080',
      },
      pauseOnHover: false,
      draggable: false,
      pauseOnFocusLoss: false
    });
    setTimeout(() => {
      navigate('/payment');
    }, 4000);
  }

  function handleSpecialistModal(isOpen) {
    setSpecialistModal(isOpen);
  }

  async function handleCall() {
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(userDataString);
    const patientId = userData?.id;
    try {
      const response = await axios.post(`https://momedic.onrender.com/api/call/initiate`, null, {
        params: {
          userId: patientId
        }
      });
      console.log(response.data);
      const responseData = response.data;
      window.open(responseData.start_url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.log(error);
      const responseData = error.response.data;
      if (responseData.error) {
        makePaymentToast(responseData.error);
      } else {
        console.log("Call not initiated ");
      }
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex h-screen">
      <ToastContainer />
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col bg-white transition-all ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Navigation */}
        <header className="w-full p-4 bg-gray-100 flex justify-between items-center shadow">
          <div className="flex-1 mr-4">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search..."
              className="w-full p-3 rounded-lg border focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4">
          {userData ? userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1).toLowerCase() : 'Doe'}
            <img src={bell} alt='notifications' className='hidden lg:block' />
            <img src={bell} alt='notifications' className='block lg:hidden' onClick={toggleSidebar} />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 overflow-auto h-full">
          <div className="relative w-full flex items-center">
            <img src={banner} alt="Banner" className="w-full h-auto" />
            <img
              src={doctor}
              alt="Doctor"
              className="absolute left-0 h-auto"
              style={{ bottom: '0', maxHeight: '100%' }}
            />
          </div>
          <div className='quick-tools mt-8 grid grid-cols-2 gap-9 md:grid-cols-2 lg:grid-cols-4 items-center justify-between'>
            <div className='call flex flex-col items-center'>
              <p className='text-[#020E7C] mb-2'>Call a doctor</p>
              <img onClick={handleCall} src={call} alt='call' />
            </div>
            <div className='call flex flex-col items-center'>
              <p className='text-[#020E7C] mb-2'>Book an Appointment</p>
              <img src={book} alt='book' />
            </div>
            <div className='call flex flex-col items-center'>
              <p className='text-[#020E7C] mb-2'>See a specialist</p>
              <div className='border-2 border-[#020E7C] rounded-full w-20 h-20 flex items-center justify-center'>
                <img onClick={() => handleSpecialistModal(true)} src={specialistIcon} alt='lab' />
              </div>
            </div>
            {specialistModal && <SpecialistModal isOpen={specialistModal} onClose={handleSpecialistModal} />}
            <div className='call flex flex-col items-center mr-5'>
              <p className='text-[#020E7C] mb-2'>Book a lab test</p>
              <img src={book} alt='lab' className='ml-5' />
            </div>
          </div>

          <h1 className='text-2xl text-[#020E7C] p-3 mt-5 mb-2 font-bold ml-20'>Choose a Plan</h1>

          <div className="quick-tools mt-10 p-3 flex lg:flex-row items-center justify-between">
            {/* Circular Divs for Plans */}
            <div className="flex flex-col items-center text-center m-3">
              <div className="w-32 h-32 flex flex-col items-center justify-center font-semibold text-[#020E7C] border border-[#020E7C] rounded-full mb-4">
                <span className='mb-2'>Instant</span>
                <span>N1500</span>
              </div>
                   <p className="text-[#7D8FB3] mb-2 max-w-xs">By clicking subscribe you can make instant calls to consult a Doctor which is valid for only 12hours.</p>
              <button className=" border text-[#7D8FB3] py-2 p-6 px-4 rounded-lg" onClick={()=>navigate('/payment')}>Subscribe</button>
            </div>
           
            <div className="flex flex-col items-center text-center m-3">
            <div className="w-32 h-32 flex flex-col items-center justify-center font-semibold bg-[#020E7C] text-white border border-blue-700 rounded-full mb-4">
         <span className='mb-2'>
         Monthly
       </span>
       <span>
         N5000
       </span>
     </div>
     <p className="text-[#7D8FB3] mb-2 max-w-80">By clicking subscribe you can make instant calls to consult a Doctor which is valid for only 1 month.</p>
     <button className="bg-[#020E7C] text-white py-2 px-4 rounded-md " onClick={()=>navigate('/payment')}>Subscribe</button>
     </div>
     <div className="flex flex-col items-center text-center m-3">
     <div className="w-32 h-32 flex flex-col items-center justify-center font-semibold bg-white text-blue-700 border border-[#020E7C] rounded-full mb-4">
       <span className='mb-2'>
         Yearly
       </span>
       <span>
         N45000
       </span>
     </div>
       <p className="text-[#7D8FB3] mb-2 max-w-80">By clicking subscribe you can make instant calls to consult a Doctor which is valid for only 1 year.</p>    
        <button className="border text-[#7D8FB3]  py-2 px-4  rounded-md" onClick={()=>navigate('/payment')}>Subscribe</button>
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
