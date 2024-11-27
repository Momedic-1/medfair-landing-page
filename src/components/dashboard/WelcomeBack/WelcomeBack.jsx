


import DoctorImg from '../../../assets/doctor.png';
import call from '../../../assets/call.svg';
import './WelcomeBack.css';
import { useEffect, useState } from 'react';
import { baseUrl } from '../../../env';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function WelcomeBack({ status }) {
  const [activeCall, setActiveCalling] = useState([]);
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
    if (activeCall.length > 0 && status === online) {
      startCallTimer();
    } else {
      clearCallTimer();
    }
  }, [activeCall, status]);

  const viewAllPendingCalls = async () => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/call/broadcast?doctorId=${userData.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("The active calls are:", response.data.data);
      setActiveCalling(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const navigateToIncomingCalls = () => {
    navigate('/incoming-call');
  };

  const startCallTimer = () => {
    clearCallTimer();
    const timer = setTimeout(() => {
      dropCall();
    }, 30000);
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
      setActiveCalling([]);
    } catch (error) {
      console.error('Error dropping the call:', error.message);
    }
  };

  return (
    <div className='w-[100%]'>
      <div
        onClick={navigateToIncomingCalls}
        style={{ cursor: 'pointer' }}
        className={`image ${isActive ? 'active' : ''} ${
          activeCall.length > 0 && status === online ? 'shake bg-green-500' : 'bg-[#020e7c]'
        } items-center grid place-items-center justify-center mb-12 w-40 h-24 border rounded-lg py-4 mx-auto md:mb-10 lg:mb-4 sm:mb-10`}
      >
        <p className='text-white font-semibold text-center'>
          Incoming<br />Calls
        </p>
        <img
          src={call}
          alt={'call'}
          className={`image ${isActive ? 'active' : ''} ${
            activeCall.length > 0 && status === online ? 'shake bg-green-500' : ''
          }`}
        />
      </div>

      <div className='flex flex-row w-[170%] -mx-14 lg:w-[100%] lg:-mx-1 sm:w-[125%] sm:-mx-14 md:w-[115%] md:-mx-14 overflow-hidden rounded-lg bg-gradient-to-r from-blue-500/40 to-white/40 sm:flex-row shadow-lg border border-[#020e7c]'>
        <div className='flex flex-1 flex-col p-4 sm:w-2/3 sm:p-3 lg:w-3/4'>
          <h2 className='mb-1 text-xl font-bold text-[#020e7c] pl-3 md:text-2xl lg:text-3xl lg:pl-5'>
            Welcome Back!
          </h2>

          <span className="font-bold text-[#020E7C] mb-4 max-w-md text-xl text-center items-center justify-center pr-[3rem] sm:pr-[12rem] lg:pr-[7rem] md:pr-[13rem]">
            Doctor{' '}
            {userData
              ? userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1).toLowerCase()
              : ''}
          </span>
        </div>
        <div className='h-44 flex-1 w-full sm:h-[13rem] sm:w-1/2 lg:w-2/5'>
          <img
            src={DoctorImg}
            loading='lazy'
            alt='Doctor A. Buchi'
            className='h-full w-full object-cover object-center rounded-lg'
          />
        </div>
      </div>
    </div>
  );
}

export default WelcomeBack;
