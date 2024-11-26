


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { baseUrl } from '../../../env';
import { useNavigate } from 'react-router-dom';

const IncomingCalls = () => {
  const [incomingCalls, setIncomingCalls] = useState([]);
  const token = JSON.parse(localStorage.getItem('authToken'))?.token;
  const userData = JSON.parse(localStorage.getItem('userData'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIncomingCalls = async () => {
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
        setIncomingCalls(response.data.data);
      } catch (error) {
        console.error('Error fetching incoming calls:', error);
      }
    };

    fetchIncomingCalls();
  }, [userData.id, token]);

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
      setIncomingCalls((prevCalls) => prevCalls.filter(call => call.callId !== callId));
      window.open(response.data.data, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error joining call:', error.message);
    }
  };

  return (
    <div className='w-full p-4'>
      <h1 className='text-2xl font-bold text-blue-500 mb-4'>Incoming Calls</h1>
      {incomingCalls.length > 0 ? (
        <div className='space-y-4'>
          {incomingCalls.map((call) => (
            <div key={call.callId} className='flex justify-between items-center border p-4 rounded-lg'>
              <p className='text-lg'>{call.callerName}</p>
              <button
                onClick={() => pickCall(call.callId)}
                className='bg-blue-500 text-white py-2 px-4 rounded-lg'
              >
                Join
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No incoming calls at the moment.</p>
      )}
    </div>
  );
};

export default IncomingCalls;
