

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { baseUrl } from '../../../env';

// const IncomingCall = () => {
//   const [incomingCalls, setIncomingCalls] = useState([]);
//   const token = JSON.parse(localStorage.getItem('authToken'))?.token;
//   const userData = JSON.parse(localStorage.getItem('userData'));

//   useEffect(() => {
//     const fetchIncomingCalls = async () => {
//       try {
//         const response = await axios.post(
//           `${baseUrl}/api/call/broadcast?doctorId=${userData.id}`,
//           {},
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         // console.log("Incoming Calls:", response.data.data);
//         setIncomingCalls(response.data.data);
//       } catch (error) {
//         console.error('Error fetching incoming calls:', error);
//       }
//     };

//     fetchIncomingCalls();
//   }, [token, userData.id]);

//   const pickCall = async (callId) => {
//     try {
//       const response = await axios.post(
//         `${baseUrl}/api/call/join`,
//         {
//           doctorId: userData?.id,
//           callId: callId,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       window.open(response.data.data, '_blank', 'noopener,noreferrer');
//       setIncomingCalls(incomingCalls.filter(call => call.callId !== callId));
//     } catch (error) {
//       console.error('Error joining call:', error);
//     }
//   };

//   return (
//     <div className='w-[70%] p-6'>
//       <h1 className='text-2xl font-bold text-[#020e7c] mb-4'>Incoming Calls</h1>
//       <div className='space-y-4'>
//         {incomingCalls.map((call) => (
//           <div key={call.callId} className='flex justify-between items-center border p-4 rounded'>
//             <div>
//               <p className='font-bold'>Call ID: {call.callId}</p>
//             </div>
//             <button
//               onClick={() => pickCall(call.callId)}
//                className='bg-green-500 text-white p-2 rounded'
//              >
//                Join Call
//              </button>
//            </div>
//          ))}
//          </div>
//      </div>
//    ); };

//    export default IncomingCall;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseUrl } from '../../../env';

const IncomingCall = () => {
  const [incomingCalls, setIncomingCalls] = useState([]);
  const token = JSON.parse(localStorage.getItem('authToken'))?.token;
  const userData = JSON.parse(localStorage.getItem('userData'));

  // Fetch incoming calls
  useEffect(() => {
    const fetchIncomingCalls = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/api/call/calls/patient-initiated`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Populate the state with incoming call details
        setIncomingCalls(response.data.data);
      } catch (error) {
        console.error('Error fetching incoming calls:', error);
      }
    };

    fetchIncomingCalls();
  }, [token, userData.id]);

  // Join call
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
      // Open the call link in a new tab
      window.open(response.data.data, '_blank', 'noopener,noreferrer');
      // Remove the picked call from the list
      setIncomingCalls((prevCalls) => prevCalls.filter((call) => call.callId !== callId));
    } catch (error) {
      console.error('Error joining call:', error);
    }
  };

  // Delete call after 2 minutes if not picked
  useEffect(() => {
    const timers = incomingCalls.map((call) => {
      return setTimeout(() => {
        setIncomingCalls((prevCalls) => prevCalls.filter((prevCall) => prevCall.callId !== call.callId));
        console.log(`Call with ID ${call.callId} deleted after timeout.`);
      }, 120000); // 2 minutes in milliseconds
    });

    return () => {
      timers.forEach(clearTimeout); // Clear timers on component unmount or updates
    };
  }, [incomingCalls]);

  return (
    <div className='w-[70%] p-6'>
      <h1 className='text-2xl font-bold text-[#020e7c] mb-4'>Incoming Calls</h1>
      <div className='space-y-4'>
        {incomingCalls.length > 0 ? (
          incomingCalls.map((call) => (
            <div key={call.callId} className='flex justify-between items-center border p-4 rounded'>
              <div>
                <p className='font-bold'>Caller Name: {call.callerName || 'Unknown Patient'}</p>
                <p>Call ID: {call.callId}</p>
                <p>
                  Time Initiated:{' '}
                  {call.timeInitiated
                    ? new Date(call.timeInitiated).toLocaleString()
                    : 'Time not available'}
                </p>
              </div>
              <button
                onClick={() => pickCall(call.callId)}
                className='bg-green-500 text-white p-2 rounded'
              >
                Join Call
              </button>
            </div>
          ))
        ) : (
          <p className='text-center text-gray-500'>No incoming calls at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default IncomingCall;
