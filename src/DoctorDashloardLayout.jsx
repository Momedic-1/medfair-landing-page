import { useState, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { baseUrl } from './env.jsx';
import Sidebar from './components/Sidebar.jsx';

export default function DoctorDashloardLayout() {
  
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
    <div className="w-full h-full overflow-auto">
      <ToastContainer />
      <div className=''>
      <Sidebar />
        <div className='lg:ml-[25%]'>

      <Outlet/>
        </div>
      </div>
    </div>
    )};
    
 
