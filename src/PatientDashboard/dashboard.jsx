
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bell from './assets/bell.svg';
import doctor from './assets/doctor.svg';
import banner from './assets/banner.svg';
import call from './assets/call (2).svg';
import book from './assets/book (2).svg';
import specialistIcon from './assets/specialis-icon.svg';
// import { baseUrl } from '../env';
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

  
<div className="flex h-screen w-[100%] overflow-hidden">
<ToastContainer />
<Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
<div className={`flex-1 flex flex-col bg-white transition-all ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
  
  <header className="w-full p-2 bg-gray-100 flex justify-between items-center shadow px-4">
    <button className="lg:hidden text-2xl p-2 focus:outline-none" onClick={toggleSidebar}>
      ☰
    </button>
    <div className="flex-1 lg:flex hidden mr-4">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search..."
        className="w-full max-w-md p-2 rounded-lg border focus:outline-none focus:ring focus:border-blue-500"
      />
    </div>

    <div className="flex items-center gap-4">
      <img src={bell} alt="notifications" className="w-4 md:w-4 sm:w-4" />
      <span className="font-bold text-[#020E7C] hidden lg:block">
        {userData ? userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1).toLowerCase() : 'Doe'}
      </span>
    </div>
  </header>
  <main className="p-4 overflow-auto h-full">
  <div className="quick-tools mt-6 grid grid-cols-2 gap-2 md:grid-cols-4">
  <div className="flex flex-col items-center cursor-pointer text-center">
    <img onClick={handleCall} src={call} alt="call" className="w-20 h-20 md:w-15 md:h-15" />
    <p className="text-[#020E7C] mt-1 text-sm md:text-xs">Call a doctor</p>
  </div>

  <div className="flex flex-col items-center cursor-pointer text-center">
    <img src={book} alt="book" className="w-20 h-20 md:w-15 md:h-15" />
    <p className="text-[#020E7C] mt-1 text-sm md:text-xs">Book an Appointment</p>
  </div>

  <div className="flex flex-col items-center cursor-pointer text-center">
    <div className="border-2 border-[#020E7C] rounded-full w-20 h-20 md:w-20 md:h-20 flex items-center justify-center">
      <img onClick={() => handleSpecialistModal(true)} src={specialistIcon} alt="specialist" className="w-8 h-8" />
    </div>
    <p className="text-[#020E7C] mt-1 text-sm md:text-xs">See a specialist</p>
  </div>

  <div className="flex flex-col items-center cursor-pointer text-center">
    <img src={book} alt="lab" className="w-20 h-20 md:w-15 md:h-15" />
    <p className="text-[#020E7C] mt-1 text-sm md:text-xs">Book a lab test</p>
  </div>
</div>



   
    {specialistModal && <SpecialistModal isOpen={specialistModal} onClose={handleSpecialistModal} />}

 
<h1 className="text-2xl text-[#020E7C] p-3  font-bold mt-5 cursor-pointer ml-2  md:ml-20 ">Choose a Plan</h1>
<div className="flex flex-wrap items-start justify-between mt-2 space-y-6 lg:space-y-0 lg:space-x-6">
 
  <div className="flex flex-col w-full md:w-[48%] lg:w-[30%] min-h-[350px] h-full bg-white p-6 border border-gray-300 rounded-lg shadow-md cursor-pointer">
   
    <div className="mb-4">
      <span className="text-blue-600 text-lg font-bold">Instant</span>
      <div className="text-4xl font-bold text-[#020E7C] leading-normal mt-2">N1500</div>
    </div>

    
    <ul className="text-[#7D8FB3] max-w-72 mb-4 space-y-2">
      <li className="flex items-start">
        <span className="text-blue-600 mr-2">✔</span>
        One-time consultation for immediate advice
      </li>
      <li className="flex items-start">
        <span className="text-blue-600 mr-2">✔</span>
        Access to certified doctors
      </li>
      <li className="flex items-start">
        <span className="text-blue-600 mr-2">✔</span>
        Available 24/7
      </li>
    </ul>

   
    <button className="mt-auto border text-white bg-[#020E7C] py-2 px-4 rounded-md" onClick={() => navigate('/payment')}>
      Subscribe
    </button>
  </div>
  
  <div className="flex flex-col w-full md:w-[48%] lg:w-[30%] min-h-[350px] h-full bg-white p-6 border border-gray-300 rounded-lg shadow-md cursor-pointer">
    
    <div className="mb-4">
      <span className="text-blue-600 text-lg font-bold">Monthly</span>
      <div className="text-4xl font-bold text-[#020E7C] mt-2">N5000</div>
    </div>
    <ul className="text-[#7D8FB3] max-w-72 mb-5 space-y-2">
      <li className="flex items-start">
        <span className="text-blue-600 mr-2">✔</span>
        Up to 4 consultations per month
      </li>
      <li className="flex items-start">
        <span className="text-blue-600 mr-2">✔</span>
        Ongoing health support
      </li>
      <li className="flex items-start">
        <span className="text-blue-600 mr-2">✔</span>
        Access to specialists
      </li>
    </ul>
    <button className="mt-auto border text-white bg-[#020E7C] py-2 px-4 rounded-md" onClick={() => navigate('/payment')}>
      Subscribe
    </button>
  </div>
  <div className="flex flex-col w-full md:w-[48%] lg:w-[30%] min-h-[350px] h-full bg-white p-6 border border-gray-300 rounded-lg shadow-md cursor-pointer">
    <div className="mb-5">
      <span className="text-blue-600 text-lg font-bold">Yearly</span>
      <div className="text-4xl font-bold text-[#020E7C] mt-2">N45000</div>
    </div>
    <ul className="text-[#7D8FB3] max-w-80 mb-4 space-y-2">
      <li className="flex items-start">
        <span className="text-blue-600 mr-2">✔</span>
        Up to 10 consultations per year
      </li>
      <li className="flex items-start">
        <span className="text-blue-600 mr-2">✔</span>
        Expert care anytime
      </li>
      <li className="flex items-start">
        <span className="text-blue-600 mr-2">✔</span>
        Priority support
      </li>
    </ul>
    <button className="mt-auto border text-white bg-[#020E7C] py-2 px-4 rounded-md" onClick={() => navigate('/payment')}>
      Subscribe
    </button>
  </div>
</div>




 
 
  </main>
</div>


{isSidebarOpen && (
  <div className="fixed inset-0 bg-black opacity-50 z-10 lg:hidden" onClick={toggleSidebar}></div>
)}


</div>


)};

