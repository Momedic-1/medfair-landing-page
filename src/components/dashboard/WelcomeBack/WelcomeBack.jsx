import DoctorImg from '../../../assets/doctor.png';
import call from '../../../assets/call.svg';
import './WelcomeBack.css';
import { useEffect, useRef, useState } from 'react';
import { baseUrl } from '../../../env';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LiaPhoneVolumeSolid } from "react-icons/lia";

function WelcomeBack({ status }) {
  const [activeCalls, setActiveCalls] = useState([]);
  const [pickedCalls, setPickedCalls] = useState(new Set()); // Track picked calls
  const [isRinging, setIsRinging] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [callTimer, setCallTimer] = useState(null); 
  const token = JSON.parse(localStorage.getItem('authToken'))?.token;
  const userData = JSON.parse(localStorage.getItem('userData'));
  const online = "Online";
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const pollingInterval = useRef(null);
  const ringtone = "https://res.cloudinary.com/da79pzyla/video/upload/v1737819241/galaxy_bells_s25_ywq7j0.mp3"

  useEffect(() => {
    viewAllPendingCalls();
    enableAudio()
    pollingInterval.current = setInterval(() => {
      viewAllPendingCalls();
    }, 5000); 

    return () => {
      clearInterval(pollingInterval.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      clearCallTimer();
    };
  }, []);

  useEffect(() => {
    if (activeCalls.length > 0 && status === online) {
      startCallTimer();
      setIsActive(true);
      playRingtone();
    } else {
      clearCallTimer();
      stopRingtone();
    }
  }, [activeCalls, status]);

  const initializeAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setAudioInitialized(true);
        })
        .catch(error => console.error('Audio initialization failed:', error));
    }
  };

  const playRingtone = () => {
    if (!audioInitialized) {
      console.warn('Audio not initialized - requiring user interaction');
      return;
    }

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .catch(error => {
          if (error.name === 'NotAllowedError') {
            setAudioInitialized(false);
            alert('Please click the "Enable Notifications" button to allow call sounds');
          }
        });
    }
  };

  const viewAllPendingCalls = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/video/broadcast-calls/${userData.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Filter out picked calls
      const filteredCalls = response?.data.filter(call => !pickedCalls.has(call.id)) || [];
      setActiveCalls(filteredCalls);
      setIsActive(filteredCalls.length > 0);
      
      if (filteredCalls.length > 0 && status === online) {
        playRingtone();
      } else {
        stopRingtone();
      }
    } catch (error) {
      console.error(error);
      stopRingtone();
    }
  };

  const stopRingtone = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsRinging(false);
    }
  };

  const navigateToIncomingCalls = (callId) => {
    stopRingtone();
    setPickedCalls(prev => new Set(prev).add(callId)); // Add the call to picked calls
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
      setActiveCalls([]);
    } catch (error) {
      console.error('Error dropping the call:', error.message);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const enableAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  };

  return (
    <div className='w-full relative px-2'>
      <audio ref={audioRef} src={ringtone} preload="auto" loop/>
      {!audioInitialized && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg">
          <button 
            onClick={initializeAudio}
            className="underline cursor-pointer"
          >
            Click here to enable sound
          </button>
        </div>
      )}

      {activeCalls?.length > 0 && (
        activeCalls.map(call => (
          <div
            key={call.id}
            onClick={() => navigateToIncomingCalls(call.id)}
            className={`image ${isActive ? 'active' : 'hidden'} ${
              activeCalls.length > 0 && status === online && 'shake bg-red-500'
            } absolute top-2 left-64 items-center grid place-items-center justify-center mb-12 w-40 h-24 border rounded-lg py-4 mx-auto cursor-pointer`}
          >
            <p className='text-white font-semibold text-center'>
              Incoming Call
            </p>
            
            <LiaPhoneVolumeSolid className={`${isActive ? 'active' : 'hidden'} ${
                activeCalls.length > 0 && status === online && 'shake text-yellow-500'
              }`} fontSize={28}/>
          </div>
        ))
      )}

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