
import React, {useEffect, useState} from 'react';
import SwipeStatus from './dashboard/SwipeStatus';
import LeftPanel from "./dashboard/LeftPanel.jsx";
import RightPanel from "./dashboard/RightPanel.jsx";
import {useNavigate} from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();
    const onlineStatus = "onlineStatus"
    const online = localStorage.getItem(onlineStatus);
    const value = online ? online : "Online";

    const [status, setStatus] = useState(value);
    const token = JSON.parse(localStorage.getItem('authToken'))?.token;

    if (!token){
        navigate('/login');
    }

    useEffect(() => {
        if (status !== value) {
            window.location.reload();
        }
    }, [status, value]);
  return (
    <div className='lg:ml-[15rem] relative '>
    
        <div
            className='flex flex-col px-2 lg:flex-row min-h-screen items-stretch lg:items-start lg:gap-x-8 justify-center bg-gray-100 p-2'>
            <LeftPanel status={status}  />
            <RightPanel/>
            
        </div>

        <div
            className='absolute bottom-2 -left-9 w-[121%]  md:-left-8 sm:-left-9  sm:w-[120%]  md:w-[100%] lg:w-[48%] lg:left-20'>
            <SwipeStatus status={status} setStatus={setStatus} />
        </div>
    
    </div>
  );
};

export default Dashboard;
