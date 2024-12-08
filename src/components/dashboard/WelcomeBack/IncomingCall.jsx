

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { baseUrl } from '../../../env';

const IncomingCall = () => {
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = JSON.parse(localStorage.getItem('authToken'))?.token;
  const userData = JSON.parse(localStorage.getItem('userData'));

  
  const incomingCallsRef = useRef([]);
  
  useEffect(() => {
    const fetchIncomingCalls = async () => {
      try {
        const [incomingResponse, patientResponse] = await Promise.all([
          axios.post(`${baseUrl}/api/call/broadcast?doctorId=${userData.id}`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseUrl}/api/call/calls/patient-initiated`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const incomingCallsData = incomingResponse.data.data || [];
        const patientCallsData = patientResponse.data.data || [];

        const allCalls = [...incomingCallsData, ...patientCallsData];
        incomingCallsRef.current = allCalls; 
        setIncomingCalls(allCalls);
      } catch (error) {
        console.error('Error fetching calls:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomingCalls();
  }, [token, userData.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();


      const updatedCalls = incomingCallsRef.current.filter(call => {
        return (now - new Date(call.callInitiationTime).getTime()) < 120000; 
      });

      
      setIncomingCalls(updatedCalls);
    }, 60000); 

    return () => clearInterval(timer);
  }, []);


  useEffect(() => {
    let timeoutId;

    if (incomingCalls.length > 0) {
      // Set timeout to execute after two minutes (120,000 milliseconds)
      timeoutId = setTimeout(() => {
        // Only show the last call in the array after 2 minutes
        setIncomingCalls([incomingCalls[incomingCalls.length - 1]]);
      }, 120000); // 2 minutes
    }

    // Cleanup timeout if the component unmounts or incomingCalls changes
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [incomingCalls]);

  const pickCall = async (callId) => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/call/join`,
        {
          doctorId: userData?.id,
          callId: callId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.open(response.data.data, '_blank', 'noopener,noreferrer');
      setIncomingCalls(incomingCalls.filter(call => call.callId !== callId));
    } catch (error) {
      console.error('Error joining call:', error);
    }
  };

  
  const formatTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString(); 
  };

  return (
    <div className='w-[100%] p-6 sm:w-[100%] lg:w-[70%] md:w-[100%]'>
      <h1 className='text-2xl font-bold text-[#020e7c] mb-4'>Incoming Calls</h1>
      {loading ? (
        <p>Loading calls...</p>
      ) : (
        <div className='space-y-4'>
          {incomingCalls.length > 0 ? incomingCalls.map((call) => (
            <div key={call.callId} className='flex justify-between items-center border p-4 rounded'>
              <div>
                <p className='font-bold'>
                  Patient: {call.patientFirstName} {call.patientLastName}
                </p>
                
                <p className='text-sm text-gray-600'>
                  Initiated at: {formatTime(call.callInitiationTime)}
                </p>
              </div>
              <button
                onClick={() => pickCall(call.callId)}
                className='bg-green-500 text-white p-2 rounded'
              >
                Join Call
              </button>
            </div>
          )) : (
            <p>No incoming calls at the moment.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default IncomingCall;
