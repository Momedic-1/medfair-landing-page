
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { baseUrl } from '../../../env';
import { useNavigate } from 'react-router-dom';

const IncomingCall = () => {
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = JSON.parse(localStorage.getItem('authToken'))?.token;
  const userData = JSON.parse(localStorage.getItem('userData'));
  const incomingCallsRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIncomingCalls = async () => {
      try {
        const incomingResponse = await axios.get(`${baseUrl}/api/v1/video/recent-calls`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let incomingCallsData = incomingResponse?.data || [];
        
        const pickedCalls = JSON.parse(localStorage.getItem('pickedCalls')) || [];
        incomingCallsData = incomingCallsData.filter(
          (call) => !pickedCalls.includes(call.callId)
        );

        incomingCallsRef.current = incomingCallsData;
        setIncomingCalls(incomingCallsData);
      } catch (error) {
        console.error('Error fetching calls:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomingCalls();
  }, [token, userData?.id]);

 

  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString();
  };

  const joinCall = async (callId) => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/video/join?callId=${callId}&doctorId=${userData?.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.data === 'Another doctor has already joined this call.') {
        toast.error('Another doctor has already joined this call.');
      } else {
        // window.open(response.data, '_blank', 'noopener,noreferrer');
        localStorage.setItem('roomUrl', response.data)
       
        const pickedCalls = JSON.parse(localStorage.getItem('pickedCalls')) || [];
        pickedCalls.push(callId);
        localStorage.setItem('pickedCalls', JSON.stringify(pickedCalls));

          
        setIncomingCalls(incomingCalls.filter((call) => call.callId !== callId)); 
        navigate('/video-call');
      }
    } catch (error) {
      console.error('Error joining call:', error);
      toast.error('Error joining call. Please try again.');
    }
  };

  return (
    <div className='w-[100%] p-6 sm:w-[100%] lg:w-[70%] md:w-[100%]'>
      <ToastContainer />
      <h1 className='text-2xl font-bold text-[#020e7c] mb-4'>Incoming Calls</h1>
      {loading ? (
        <p>Loading calls...</p>
      ) : (
        <div className='space-y-4'>
          {incomingCalls.length > 0 ? (
            incomingCalls.map((call) => (
              <div
                key={call.callId}
                className='flex justify-between items-center border p-4 rounded '
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
                  onClick={() => joinCall(call.callId)}
                  className='bg-green-500 text-white p-2 rounded'
                >
                  Join Call
                </button>
              </div>
            ))
          ) : (
            <p>No incoming calls at the moment.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default IncomingCall;
