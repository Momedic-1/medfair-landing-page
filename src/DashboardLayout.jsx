import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import LeftPanel from './components/dashboard/LeftPanel';
import RightPanel from './components/dashboard/RightPanel';
import SwipeStatus from './components/dashboard/SwipeStatus'
import Appointments from './components/dashboard/Appointments';
import { LiaPhoneVolumeSolid } from 'react-icons/lia';
import WelcomeBack from './components/dashboard/WelcomeBack/WelcomeBack';
import AppointmentRequests from './components/dashboard/AppointmentRequests';
import DoctorInfo from './components/dashboard/DoctorInfo';

const DashboardLayout = () => {
    const [isActive, setIsActive] = useState(false);
      const [activeCalls, setActiveCalls] = useState([]);
    const navigate = useNavigate();
    const onlineStatus = "onlineStatus"
    const online = localStorage.getItem(onlineStatus);
    const value = online ? online : "Online";
    console.log("value ", value);

    const [status, setStatus] = useState(value);
    const token = JSON.parse(localStorage.getItem('authToken'))?.token;

    if (!token){
        navigate('/login');
    }

     const navigateToIncomingCalls = () => {
    navigate('/incoming-call');
  };

    useEffect(() => {
        if (status !== value) {
            window.location.reload();
        }
    }, [status, value]);
  return (
    <div className='h-full w-full flex flex-col items-center justify-center'>
      <WelcomeBack status={status} />
      <div className='w-full flex flex-col-reverse lg:flex-row h-full items-stretch lg:items-start lg:gap-x-8 justify-center bg-gray-100'>
        <AppointmentRequests appointments={activeCalls}/>
       <Appointments />
      </div>
      <div>
        <DoctorInfo/>
      </div>
      
       {/* <div
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
      </div> */}

        {/* <div
            className='flex flex-col lg:flex-row h-full items-stretch lg:items-start lg:gap-x-8 justify-center bg-gray-100'>
            <LeftPanel status={status}  />
            <RightPanel/>
            
        </div> */}

        {/* <div
            className='w-full fixed left-0 bottom-0 md:w-[90%] md:left-4 lg:w-[48%] lg:left-80 md:bottom-4'>
            <SwipeStatus status={status} setStatus={setStatus} />
        </div> */}
    
    </div>
  );
};

export default DashboardLayout
