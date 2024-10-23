
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
function makePaymentToast(message){
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
}
  function handleSpecialistModal(isOpen){    
    setSpecialistModal(isOpen)    
  }

  async function handleCall(){
  const userDataString = localStorage.getItem('userData');

  const userData = JSON.parse(userDataString);
  const patientId = userData?.id
      try{
          // const response = await axios.post( `${baseUrl}/api/call/initiate`, null, {
          const response = await axios.post( `https://momedic.onrender.com/api/call/initiate`, null, {
              params: {
                  userId: patientId
              }
          })
          console.log(response.data)
          const responseData = response.data
              window.open(responseData.start_url, '_blank', 'noopener,noreferrer');

      }catch (error){
          console.log(error)

          if (error.message === "Network Error") {
              makePaymentToast(error.message)
          }
          const responseData = error.response.data
          if (responseData.error ) {
              makePaymentToast(responseData.error)
              setTimeout(() => {
                      navigate('/payment');
              }, 4000)
          }else{
              console.log("Call not initiated ");
          }
      }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="flex h-screen w-[100%] overflow-x-hidden">
    <ToastContainer />
  
   
    <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
  
   
    <div className={`flex-1 flex flex-col bg-white transition-all ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
      
     
      <header className="w-full p-2 bg-gray-100 flex justify-between items-center shadow px-4">

  <button className="lg:hidden text-2xl p-2 focus:outline-none" onClick={toggleSidebar}>
    ☰
  </button>


  <div className="hidden lg:block flex-1 mr-4">
    <input
      type="text"
      value={searchTerm}
      onChange={handleSearchChange}
      placeholder="Search..."
      className="w-full max-w-md p-2 rounded-lg border focus:outline-none focus:ring focus:border-blue-500"
    />
  </div>


  <div className="flex items-center gap-6">
   
    <img 
      src={bell} 
      alt="notifications" 
      className="w-6 md:w-5 sm:w-5" 
      style={{ display: 'block' }} 
    />
    
   
    <span className="font-bold text-[#020E7C] hidden lg:block">
      {userData ? userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1).toLowerCase() : 'Doe'}
    </span>
  </div>
</header>

  
     
      <main className="p-6 overflow-auto h-full">
        <div className="relative w-full flex items-center">
          <img src={banner} alt="Banner" className="w-full h-auto" />
          <img src={doctor} alt="Doctor" className="absolute left-0 h-auto" style={{ bottom: '0', maxHeight: '100%' }} />
        </div>
  
       
        <div className="quick-tools mt-8 flex flex-row gap-1 justify-between items-center">

  <div className="call flex flex-col items-center cursor-pointer text-center w-1/5">
    <img
      onClick={handleCall}
      src={call}
      alt="call"
      className="w-10 h-10 md:w-14 md:h-14" 
    />
    <p className="text-[#020E7C] mt-1 text-[10px] md:text-xs">Call a doctor</p> {/* Smaller text */}
  </div>

 
  <div className="call flex flex-col items-center cursor-pointer text-center w-1/5">
    <img
      src={book}
      alt="book"
      className="w-10 h-10 md:w-14 md:h-14"  
    />
    <p className="text-[#020E7C] mt-1 text-[10px] md:text-xs">Book an Appointment</p> {/* Smaller text */}
  </div>

  <div className="call flex flex-col items-center cursor-pointer text-center w-1/5">
    <div className="border-2 border-[#020E7C] rounded-full w-10 h-10 md:w-14 md:h-14 flex items-center justify-center">
      <img
        onClick={() => handleSpecialistModal(true)}
        src={specialistIcon}
        alt="specialist"
        className="w-6 h-6"
      />
    </div>
    <p className="text-[#020E7C] mt-1 text-[10px] md:text-xs">See a specialist</p> {/* Smaller text */}
  </div>

 
  <div className="call flex flex-col items-center cursor-pointer text-center w-1/5">
    <img
      src={book}
      alt="lab"
      className="w-10 h-10 md:w-14 md:h-14"  
    />
    <p className="text-[#020E7C] mt-1 text-[10px] md:text-xs">Book a lab test</p> {/* Smaller text */}
  </div>
</div>

  
        {specialistModal && <SpecialistModal isOpen={specialistModal} onClose={handleSpecialistModal} />}
  
   
        <h1 className="text-2xl text-[#020E7C] p-3 font-bold mt-5 cursor-pointer">Choose a Plan</h1>
        
        <div className="quick-tools mb-1 p-3 flex lg:flex-row items-center justify-between cursor-pointer">
         
          <div className="flex flex-col items-center text-center m-3 cursor-pointer">
            <div className="w-32 h-32 flex flex-col items-center justify-center font-semibold text-[#020E7C] border border-[#020E7C] rounded-full mb-4">
              <span className="mb-2">Instant</span>
              <span>N1500</span>
            </div>
            <p className="text-[#7D8FB3] mb-2 max-w-xs">By clicking subscribe you can make instant calls to consult a Doctor which is valid for only 12 hours.</p>
            <button className="border text-[#7D8FB3] py-2 px-4 rounded-lg" onClick={() => navigate('/payment')}>Subscribe</button>
          </div>
  
      
          <div className="flex flex-col items-center text-center m-3">
            <div className="w-32 h-32 flex flex-col items-center justify-center font-semibold bg-[#020E7C] text-white border border-blue-700 rounded-full mb-4">
              <span className="mb-2">Monthly</span>
              <span>N5000</span>
            </div>
            <p className="text-[#7D8FB3] mb-2 max-w-80">By clicking subscribe you can make instant calls to consult a Doctor which is valid for only 1 month.</p>
            <button className="bg-[#020E7C] text-white py-2 px-4 rounded-md" onClick={() => navigate('/payment')}>Subscribe</button>
          </div>
  
        
          <div className="flex flex-col items-center text-center m-3">
            <div className="w-32 h-32 flex flex-col items-center justify-center font-semibold bg-white text-blue-700 border border-[#020E7C] rounded-full mb-4">
              <span className="mb-2">Yearly</span>
              <span>N45000</span>
            </div>
            <p className="text-[#7D8FB3] mb-2 max-w-80">By clicking subscribe you can make instant calls to consult a Doctor which is valid for only 1 year.</p>
            <button className="border text-[#7D8FB3] py-2 px-4 rounded-md" onClick={() => navigate('/payment')}>Subscribe</button>
          </div>
        </div>
      </main>
    </div>
  
    {isSidebarOpen && (
      <div className="fixed inset-0 bg-black opacity-50 z-10 lg:hidden" onClick={toggleSidebar}></div>
    )}
  </div>
  
  
 

);
}
