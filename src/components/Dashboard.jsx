import {useEffect, useState} from 'react';
// import SwipeStatus from './dashboard/SwipeStatus';
import LeftPanel from "./dashboard/LeftPanel.jsx";
// import RightPanel from "./dashboard/RightPanel.jsx";
// import Income from "./dashboard/Income.jsx";
import {useNavigate} from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCall, setRoomUrl } from "../features/authSlice";

const Dashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const onlineStatus = "onlineStatus"
    const online = localStorage.getItem(onlineStatus);
    const value = online ? online : "Online";

    const [status, setStatus] = useState(value);
    const [rejoinData, setRejoinData] = useState(null);
    const token = JSON.parse(localStorage.getItem('authToken'))?.token;

    if (!token){
        navigate('/login');
    }

    useEffect(() => {
        if (status !== value) {
            window.location.reload();
        }
    }, [status, value]);

    useEffect(() => {
        // Initialize potential rejoin state from localStorage and auto-expire after 40 minutes
        const rawActiveCall = localStorage.getItem("activeCall");
        if (rawActiveCall) {
            try {
                const parsed = JSON.parse(rawActiveCall);
                const now = Date.now();
                if (parsed?.expiresAt && now < parsed.expiresAt) {
                    setRejoinData(parsed);
                } else {
                    localStorage.removeItem("activeCall");
                }
            } catch (_) {
                localStorage.removeItem("activeCall");
            }
        }
    }, []);

    const handleRejoin = () => {
        try {
            const raw = localStorage.getItem("activeCall");
            if (!raw) return;
            const active = JSON.parse(raw);
            const now = Date.now();
            if (active?.expiresAt && now >= active.expiresAt) {
                localStorage.removeItem("activeCall");
                setRejoinData(null);
                return;
            }
            if (active?.patientId) {
                localStorage.setItem("patientId", active.patientId);
            }
            if (active?.joinRoomUrl) {
                dispatch(setRoomUrl(active.joinRoomUrl));
            }
            if (active?.call) {
                dispatch(setCall(active.call));
            }
            navigate("/video-call");
        } catch (_) {
            // fail silently
        }
    };

    const dismissRejoin = () => {
        localStorage.removeItem("activeCall");
        setRejoinData(null);
    };

    const remainingMinutes = (expiresAt) => {
        const diffMs = Math.max(0, (expiresAt || 0) - Date.now());
        return Math.ceil(diffMs / (60 * 1000));
    };
  return (
    <div className='relative min-h-screen'>
        {rejoinData ? (
            <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="text-sm md:text-base">
                        You have an ongoing call with {rejoinData?.call?.patientFirstName} {rejoinData?.call?.patientLastName}. {remainingMinutes(rejoinData?.expiresAt)} min left to rejoin.
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleRejoin} className="bg-white text-blue-700 px-3 py-1 rounded">Rejoin</button>
                        <button onClick={dismissRejoin} className="bg-blue-500 text-white px-3 py-1 rounded border border-white/30">Dismiss</button>
                    </div>
                </div>
            </div>
        ) : null}
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
