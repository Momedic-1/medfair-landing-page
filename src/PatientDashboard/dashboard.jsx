
import { useState,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import bell from './assets/bell.svg';
import call from './assets/call (2).svg';
import book from './assets/book (2).svg';
import specialistIcon from './assets/specialis-icon.svg';
// import { baseUrl } from '../env';
import SpecialistModal from '../PatientSignup/SpecialistModal';
import Sidebar from './Sidebar';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { ActiveSlide } from './constants';

// import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';


export default function Dashboard() {
  const [specialistModal, setSpecialistModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const userData = JSON.parse(localStorage.getItem('userData'));
  const swiperRef = useRef(null);

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

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

  
<div className="flex h-screen overflow-hidden  w-full ">
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
      Welcome,
        {userData ? userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1).toLowerCase() : 'Doe'}
      </span>
    </div>
  </header>
  <div className='flex  justify-center items-center font-bold text-[#7D8FB3] '>
  <p >How can we assist you today?</p>
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
      <img src={book} alt="book" className="w-20 h-20 md:w-15 md:h-15 cursor-pointer" />
      <p className="text-[#020E7C] mt-1 text-sm md:text-xs">Book an Appointment</p>
    </div>

    <div className="flex flex-col items-center  text-center">
      <div className="border-2 border-[#020E7C] rounded-full w-20 h-20 md:w-20 md:h-20 flex items-center justify-center">
        <img
          onClick={() => handleSpecialistModal(true)}
          src={specialistIcon}
          alt="specialist"
          className="w-8 h-8 cursor-pointer"
        />
      </div>
      <p className="text-[#020E7C] mt-1 text-sm md:text-xs">See a specialist</p>
    </div>

    <div className="flex flex-col items-center  text-center">
      <img src={book} alt="lab" className="w-20 h-20 md:w-15 md:h-15 cursor-pointer" />
      <p className="text-[#020E7C] mt-1 text-sm md:text-xs">Book a lab test</p>
    </div>
  </div>

  {specialistModal && (
    <SpecialistModal isOpen={specialistModal} onClose={handleSpecialistModal} />
  )}

 
  <h1 className="text-2xl text-[#020E7C] p-3 font-bold mt-5 cursor-pointer ml-2 md:ml-20">
    Choose a Subscription Plan
    </h1>
    <div className=" m-auto">
  <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
    {ActiveSlide.map((swipe, index) => (
      <div
        key={index}
        className="flex flex-col w-full max-w-md min-h-[350px] bg-white p-5 border border-gray-300 rounded-lg shadow-md mb-8"
      >
        <span className="text-blue-600 text-lg font-bold">{swipe.title}</span>
        <div className="text-4xl font-bold text-[#020E7C] mt-2">{swipe.subTitle}</div>
        <button className="mt-7 w-32  border text-white bg-[#020E7C] py-2 px-4 rounded-3xl"onClick={() => navigate('/payment')}>
          Subscribe
        </button>
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


</div>


)};

 