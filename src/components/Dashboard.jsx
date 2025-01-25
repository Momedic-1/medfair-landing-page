
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
    console.log("value ", value);

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
    <div className='relative'>
    
        <div
            className='flex flex-col lg:flex-row h-full items-stretch lg:items-start lg:gap-x-8 justify-center bg-gray-100'>
            <LeftPanel status={status}  />
            <RightPanel/>
            
        </div>

        {/* <div
            className='w-full fixed left-0 bottom-0 md:w-[90%] md:left-4 lg:w-[48%] lg:left-80 md:bottom-4'>
            <SwipeStatus status={status} setStatus={setStatus} />
        </div> */}
    
    </div>
  );
};

export default Dashboard;
