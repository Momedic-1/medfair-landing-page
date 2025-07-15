import {useEffect, useState} from 'react';
// import SwipeStatus from './dashboard/SwipeStatus';
import LeftPanel from "./dashboard/LeftPanel.jsx";
// import RightPanel from "./dashboard/RightPanel.jsx";
// import Income from "./dashboard/Income.jsx";
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
    <div className='relative min-h-screen'>
        <div className='flex flex-col h-full items-stretch justify-start bg-gray-100 overflow-y-auto'>
            <LeftPanel status={status} />
            <div className='w-full p-4 overflow-y-auto'>
                {/* <Income /> */}
            </div>
        </div>

        {/* <div
            className='w-full fixed left-0 bottom-0 md:w-[90%] md:left-4 lg:w-[48%] lg:left-80 md:bottom-4'>
            <SwipeStatus status={status} setStatus={setStatus} />
        </div> */}
    </div>
  );
};

export default Dashboard;
