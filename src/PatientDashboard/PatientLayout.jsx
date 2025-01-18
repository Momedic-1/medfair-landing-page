import { useState, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { baseUrl } from "../env.jsx";

export default function PatientLayout() {
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [specialistModal, setSpecialistModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const handleModalClose = () => setModalOpen(false);
  const navigate = useNavigate();
  const swiperRef = useRef(null);


  
  const token = localStorage.getItem('authToken');
  const userData = JSON.parse(localStorage.getItem('userData'));

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
  }

  const handleServiceClick = (serviceName) => {
   
        const serviceUnavailable = true;
    
         if (serviceUnavailable) {
          setModalTitle(serviceName);
           setModalMessage(`Sorry, ${serviceName} is currently not available.`);
          setModalOpen(true);
        }
       };
    

    const openSpecialistModal = () => {
      setSpecialistModal(true);
    };
  
    
    const closeSpecialistModal = () => {
      setSpecialistModal(false);
    };
  async function handleCall() {
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(userDataString);
    const patientId = userData?.id;

    try {
      const response = await axios.post(`${baseUrl}/api/v1/video/create-meeting?patientId=${patientId}`,  {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
     
      const responseData = response.data;
      const roomUrl = responseData.roomUrl;

      if(roomUrl){
        window.open(roomUrl, '_blank', 'noopener,noreferrer');
      }else{
        console.log("Room URL not found in response");
      }
     
    } catch (error) {
      console.log(error,"error mssg")
      if (error.message === "Network Error") {
        
        makePaymentToast(error.message);
      }
      const responseData = error.response?.data;
      if (responseData?.error) {
        makePaymentToast(responseData.error);
      } else {
        console.log("Call not initiated");
      }
    }
  }

  const handleSubmit = async (e, subtitle) => {
    e.preventDefault();

    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.emailAddress) {
      return;
    }

    const validAmounts = [100, 5000, 4500];
    const amountInKobo = parseFloat(subtitle);

    if (!validAmounts.includes(amountInKobo)) {
      return;
    }

    const data = {
      email: userData.emailAddress,
      amount: amountInKobo,
    };

    try {
      const response = await axios.post(`${baseUrl}/api/payment/initialize-payment`, data);

      if (response.data) {
        window.location.href = response.data;
      }
    } catch (error) {
      alert('Payment failed: ' + (error.response?.data || error.message));
    }
  };
  const handleSearchChange = (e) => {
         setSearchTerm(e.target.value);
       };
  const userName = userData?.firstName.charAt(0).toUpperCase() + userData?.firstName.slice(1).toLowerCase();

  return (
    <div className="w-full">
     {/* <ToastContainer />
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
           Welcome,
            {userName}
          </span>
        </div>
      </header>
      <div className='flex  justify-center items-center font-bold text-[#7D8FB3] '>
      <p >How can we assist you today {userName}?</p>
    </div>
    
         <main className="p-4 overflow-auto h-full">
        
      <div className="quick-tools mt-6 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="flex flex-col items-center  text-center">
          <img
            onClick={handleCall}
            src={call}
            alt="call"
            className="w-20 h-20 md:w-15 md:h-15 cursor-pointer"
          />
          <p className="text-[#020E7C] mt-1 text-sm md:text-xs">Call a doctor</p>
        </div>
    
        <div className="flex flex-col items-center  text-center">
          <img src={CalendarIcon} alt="book" className="w-16 h-20  md:w-15 md:h-15 cursor-pointer" onClick={() => handleServiceClick('Book an Appointment')}/>
          <p className="text-[#020E7C] mt-1 text-sm md:text-xs">Book an Appointment</p>
        </div>
    
        <div className="flex flex-col items-center  text-center">
          <div className="border-2 border-[#020E7C] rounded-full w-20 h-20 md:w-20 md:h-20 flex items-center justify-center">
          <img
                onClick={openSpecialistModal}
                 src={specialistIcon}
               alt="specialist"
               className="w-8 h-8 cursor-pointer"
             />

          </div>
        
          <p className="text-[#020E7C] mt-1 text-sm md:text-xs">See a specialist</p>
        </div>
    
        <div className="flex flex-col items-center  text-center ">
          <img src={testTube} alt="lab" className="w-20 h-20 md:w-15 md:h-15 cursor-pointer rounded-md" onClick={()=> handleServiceClick('Book a lab test')} />
          <p className="text-[#020E7C] mt-1 text-sm md:text-xs">Book a lab test</p>
        </div>
      </div>
       <InfoModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            title={modalTitle}
            message={modalMessage}
       />
     
      {specialistModal && <Specialist closeModal={closeSpecialistModal} />}
     
      <h1 className="sm:text-2xl text-[19px] text-[#020E7C] p-3 font-bold mt-5 cursor-pointer ml-2 md:ml-20">
        Choose a Subscription Plan
        </h1>
        <div className=" ">
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-8">
        {ActiveSlide.map((swipe, index) => (
          <div
            key={index}
            className="flex flex-col w-full max-w-md min-h-[350px] bg-white p-5 border border-gray-300 rounded-lg shadow-md mb-8"
          >
            <span className="text-blue-600 text-lg font-bold">{swipe.title}</span>
            <div className="text-4xl font-bold text-[#020E7C] mt-2">{swipe.subTitle}</div>
            <button className="mt-7 w-32  border text-white bg-[#020E7C] py-2 px-4 rounded-3xl" onClick={(e) => handleSubmit(e, swipe.subTitle)}>
              Subscribe
            </button>
            <div className="border-y-2 mt-3" />
            <div className="">
              <ul className="text-[#7D8FB3] max-w-72 mb-5 space-y-2">
                {swipe.content.map((content, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-600 mr-2">✔</span> {content}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
      
    </main>
    </div>
    {isSidebarOpen && (
      <div className="fixed inset-0 bg-black opacity-50 z-10 lg:hidden" onClick={toggleSidebar}></div>
    )}
     */}
  

      <ToastContainer />
      <div className='w-full h-screen lg:overflow-hidden flex flex-col lg:flex-row lg:justify-between'>
      <div className='lg:w-[20%]'>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
     
      <div className="w-full lg:w-[80%] bg-gray-100">
         <div className='w-full'>
            <div className={`flex flex-col bg-white transition-all ${isSidebarOpen ? '' : 'ml-0'}`}>
        <header className="w-full p-2 h-16 bg-white flex justify-between items-center shadow px-4">
         <button className="lg:hidden text-2xl p-2 focus:outline-none" onClick={toggleSidebar}>
           ☰
        </button>

       
        <div className="flex items-center gap-4">
          
          <span className="font-bold text-[#020E7C] hidden lg:block">
           Welcome,
            {userName}
          </span>
        </div>
         {isSidebarOpen && (
      <div className="fixed inset-0 bg-black opacity-50 z-10 lg:hidden" onClick={toggleSidebar}></div>
    )}
      </header>
      </div>
      </div>
      <Outlet/>
      </div>
      </div>
    </div>
    )};
    
 
