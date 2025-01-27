
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { baseUrl } from '../../../env';
import { useNavigate } from 'react-router-dom';
import { Hourglass } from 'react-loader-spinner';
import { useDispatch } from 'react-redux';
import { setCall, setRoomUrl } from '../../../features/authSlice';
import NoCalls from '../../../assets/NoCalls';
import { getToken } from '../../../utils';

const IncomingCall = () => {
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = getToken()
  const userData = JSON.parse(localStorage.getItem('userData'));
  const incomingCallsRef = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchIncomingCalls = async () => {
      try {
        const incomingResponse = await axios.get(`${baseUrl}/api/v1/video/recent-calls`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(incomingResponse, 'incomingResponse');

        let incomingCallsData = incomingResponse?.data || [];
        setIncomingCalls(incomingResponse?.data || []);
        const pickedCalls = JSON.parse(localStorage.getItem('pickedCalls')) || [];
        incomingCallsData = incomingCallsData.filter(
          (call) => !pickedCalls.includes(call.callId)
        );

        incomingCallsRef.current = incomingCallsData;
        // setIncomingCalls(incomingCallsData);
      } catch (error) {
        console.error('Error fetching calls:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomingCalls();
  }, [userData?.id]);

  const navigateToDashboard = ()=> {
    navigate('/doctor-dashboard');
  }
 
  console.log(incomingCalls, 'incomingCalls');
  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString();
  };

  
  const joinCall = async (call) => {
    const callId = call.callId
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/video/join?callId=${callId}&doctorId=${userData?.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { patientId, joinRoomUrl } = response.data;
      
      if (joinRoomUrl) {
        
        dispatch(setRoomUrl(joinRoomUrl));
        dispatch(setCall(call));
        localStorage.setItem('patientId', patientId);
       
        const pickedCalls = JSON.parse(localStorage.getItem('pickedCalls')) || [];
        pickedCalls.push(callId);
        localStorage.setItem('pickedCalls', JSON.stringify(pickedCalls));
  
        setIncomingCalls(incomingCalls.filter((call) => call.callId !== callId));
  
      
        navigate('/video-call');
      } else {
        toast.error('Another doctor has already joined this call.');
      }
    } catch (error) {
      console.error('Error joining call:', error);
      toast.error('Error joining call. Please try again.');
    }
  };
  
  return (
    <div className='w-full p-6'>
      <ToastContainer />
      {/* <h1 className='text-2xl font-bold text-[#020e7c] mb-4'>Incoming Calls</h1> */}
      {loading ? (
        <div className='w-full h-[60vh] flex justify-center items-center'>
        <Hourglass
          visible={true}
          height="60"
          width="60"
          ariaLabel="hourglass-loading"
          wrapperStyle={{}}
          wrapperClass=""
          colors={['#306cce', '#72a1ed']}
        />
  </div>
      ) : (
        <div className='space-y-4'>
          {incomingCalls.length > 0 ? (
            incomingCalls.map((call) => (
              <div
                key={call.callId}
                className='w-1/2 flex justify-between items-center border p-4 rounded '
              >
                <div>
                  <p className='font-bold'>
                    Patient: {call.patientFirstName} {call.patientLastName}
                  </p>
                  <p className='text-sm text-gray-600'>
                    Initiated at: {formatTime(call.callInitiationTime)}
                  </p>
                </div>
                <button
                  onClick={() => joinCall(call)}
                  className='bg-green-500 text-white p-2 rounded'
                >
                  Join Call
                </button>
              </div>
            ))
          ) : (
            <div className='w-full h-[80vh] flex flex-col justify-center items-center'>
              <NoCalls/>
            <p className='text-gray-950/60 text-lg'>No incoming calls at the moment.</p>
            <button onClick={navigateToDashboard} className='w-[300px] h-[40px] bg-blue-600 rounded-lg text-lg text-white mt-10'>Return back to dashboard</button>
            </div>
          )}
        </div>
      )}
      

    </div>
  );
};

export default IncomingCall;
