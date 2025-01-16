
import DoctorImg from '../../../assets/doctor.png';
import call from '../../../assets/call.svg';
import './WelcomeBack.css';
import { useEffect, useState } from 'react';
import { baseUrl } from '../../../env';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LiaPhoneVolumeSolid } from "react-icons/lia";

function WelcomeBack({ status }) {
  const [activeCalls, setActiveCalls] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [callTimer, setCallTimer] = useState(null); 
  const token = JSON.parse(localStorage.getItem('authToken'))?.token;
  const userData = JSON.parse(localStorage.getItem('userData'));
  const online = "Online";
  const navigate = useNavigate();

  useEffect(() => {
    viewAllPendingCalls();
  }, []);

  useEffect(() => {
    if (activeCalls.length > 0 && status === online) {
      startCallTimer();
      setIsActive(true);
    } else {
      clearCallTimer();
    }
  }, [token, activeCalls, status]);

  const viewAllPendingCalls = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/video/broadcast-calls/${userData.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setActiveCalls(response?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  console.log(activeCalls, 'activeCalls');

  const navigateToIncomingCalls = () => {
    navigate('/incoming-call');
  };

  const startCallTimer = () => {
    clearCallTimer();
    const timer = setTimeout(() => {
      dropCall();
    }, 60000);
    setCallTimer(timer);
  };

  const clearCallTimer = () => {
    if (callTimer) {
      clearTimeout(callTimer);
      setCallTimer(null);
    }
  };

  const dropCall = async () => {
    try {
      console.log('Call dropped due to timeout');
      setActiveCalls([]);
    } catch (error) {
      console.error('Error dropping the call:', error.message);
    }
  };

  return (
    <div className='w-full relative px-2'>
      <div
        onClick={navigateToIncomingCalls}
        className={`image ${isActive ? 'active' : 'hidden'} ${
          activeCalls.length > 0 && status === online && 'shake bg-green-500'
        } absolute top-2 left-64 items-center grid place-items-center justify-center mb-12 w-40 h-24 border rounded-lg py-4 mx-auto cursor-pointer`}
      >
        <p className='text-white font-semibold text-center'>
          Incoming Calls
        </p>
        
        <LiaPhoneVolumeSolid className={`${isActive ? 'active' : 'hidden'} ${
            activeCalls.length > 0 && status === online && 'shake text-green-500'
          }`} fontSize={28}/>
      </div>

      <div className='w-full flex flex-row bg-white rounded-lg border border-gray-950/20'>
        <div className='flex flex-1 flex-col justify-center px-8 gap-y-4 w-1/2'>
          <h2 className='mb-1 text-xl font-bold text-[#020e7c] md:text-2xl lg:text-3xl'>
            Welcome Back!
          </h2>

          <span className="font-bold text-[#020E7C] mb-4 max-w-md text-xl text-left pr-[3rem] sm:pr-[12rem] lg:pr-[7rem] md:pr-[13rem]">
            Doctor{' '}
            {userData
              ? userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1).toLowerCase()
              : ''}
          </span>
        </div>
        <div className='w-full h-44 flex-1 sm:h-[13rem] md:w-1/2'>
          <img
            src={DoctorImg}
            loading='lazy'
            alt='Doctor A. Buchi'
            className='w-full object-cover h-full rounded-lg'
          />
        </div>
      </div>
    </div>
  );
}

export default WelcomeBack;
