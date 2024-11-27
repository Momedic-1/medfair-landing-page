
// import AvatarImage from '../../assets/avatar.png';
// import axios from 'axios';
// import React, { useState, useEffect } from 'react';
// import {baseUrl} from "../../env.jsx";

// export default function RecentPatients() {
  
//   const [patients, setPatients] = useState([]); 
//   const [loading, setLoading] = useState(true);  
//   const [error, setError] = useState(null); 


//   useEffect(() => {
//     const id = sessionStorage.getItem("id");
//     axios.get(`${baseUrl}/api/call/${id}/patients-consultation`)
//     // axios.get(`${baseUrl}/call/${id}/patients-consultation`)
//       .then(response => {
//         setPatients(response.data); 
//         setLoading(false);           
//       })
//       .catch(err => {
//         setError('Failed to fetch recent patients data.'); 
//         setLoading(false);
//       });
//   }, []);

//   return (
//     <div className='max-w-screen-2xl w-full mx-auto overflow-x-scroll'>
//       <div className='bg-white shadow-lg rounded-lg border border-blue-300'>
//         <h2 className='text-xl font-bold text-[#020e7c] p-4'>
//           Recent Patients
//         </h2>
//         {loading ? (
//           <div className='p-4'>Loading...</div>
//         ) : (
//           <div className='max-h-80 overflow-y-auto'>
         
//             <table className='w-full table-auto text-sm text-left'>
//               <thead className='bg-blue-50 text-[#020e7c] font-semibold border-b'>
//                 <tr>
//                   <th className='py-3 px-6'>Name</th>
//                   <th className='py-3 px-6'>Age</th>
//                   <th className='py-3 px-6'>Date</th> 
//                   <th className='py-3 px-6'>Status</th> 
//                 </tr>
//               </thead>
             
//               <tbody className='divide-y divide-gray-200'>
//                 {patients.length === 0 ? (
//                   <tr>
//                     <td colSpan="4" className="py-4 px-6 text-center text-gray-500">
//                       No recent patients found.
//                     </td>
//                   </tr>
//                 ) : (
//                   patients.map((patient, index) => (
//                     <tr
//                       key={index}
//                       className='hover:bg-blue-50 transition duration-300'
//                     >
//                       <td className='flex items-center gap-x-3 py-3 px-6 whitespace-nowrap'>
//                         <img
//                           src={AvatarImage}  
//                           className='w-10 h-10 rounded-full'
//                           alt={patient.patientName}
//                         />
//                         <div>
//                           <span className='block text-[#020e7c] font-semibold'>
//                             {patient.patientName}
//                           </span>
//                         </div>
//                       </td>
//                       <td className='py-4 px-6 text-[#020e7c] whitespace-nowrap'>
//                         {patient.age}
//                       </td>
//                       <td className='py-4 px-6 text-[#020e7c] whitespace-nowrap'>
//                         {new Date(patient.callDate).toLocaleDateString()}  
//                       </td>
//                       <td
//                         className={`py-4 px-6 whitespace-nowrap font-semibold ${
//                           patient.callStatus === 'Attended'
//                             ? 'text-green-500'
//                             : 'text-red-500'
//                         }`}
//                       >
//                         {patient.callStatus}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import AvatarImage from '../../assets/avatar.png';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { baseUrl } from "../../env.jsx";

export default function RecentPatients() {
  const [patients, setPatients] = useState([]); 
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null); 


  const token = JSON.parse(localStorage.getItem('authToken'))?.token;
  useEffect(() => {
   const id = sessionStorage.getItem("id");
    if (!token) {
      setError('Authorization token is missing');
      setLoading(false);
      return;
    }

  
    axios.get(`${baseUrl}/api/call/${id}/patients-consultation`, {
      headers: {
        Authorization: `Bearer ${token}`, 
      }
    })
    .then(response => {
      setPatients(response.data); 
      setLoading(false);           
    })
    .catch(err => {
      setError('Failed to fetch recent patients data.'); 
      setLoading(false);
    });
  }, [token]);

  return (
    <div className='max-w-screen-2xl w-full mx-auto overflow-x-scroll'>
      <div className='bg-white shadow-lg rounded-lg border border-blue-300'>
        <h2 className='text-xl font-bold text-[#020e7c] p-4'>
          Recent Patients
        </h2>
        {loading ? (
          <div className='p-4'>Loading...</div>
        ) : error ? (
          <div className='p-4 text-red-500'>{error}</div>
        ) : (
          <div className='max-h-80 overflow-y-auto'>
            <table className='w-full table-auto text-sm text-left'>
              <thead className='bg-blue-50 text-[#020e7c] font-semibold border-b'>
                <tr>
                  <th className='py-3 px-6'>Name</th>
                  <th className='py-3 px-6'>Age</th>
                  <th className='py-3 px-6'>Date</th> 
                  <th className='py-3 px-6'>Status</th> 
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 px-6 text-center text-gray-500">
                      No recent patients found.
                    </td>
                  </tr>
                ) : (
                  patients.map((patient, index) => (
                    <tr
                      key={index}
                      className='hover:bg-blue-50 transition duration-300'
                    >
                      <td className='flex items-center gap-x-3 py-3 px-6 whitespace-nowrap'>
                        <img
                          src={AvatarImage}  
                          className='w-10 h-10 rounded-full'
                          alt={patient.patientName}
                        />
                        <div>
                          <span className='block text-[#020e7c] font-semibold'>
                            {patient.patientName}
                          </span>
                        </div>
                      </td>
                      <td className='py-4 px-6 text-[#020e7c] whitespace-nowrap'>
                        {patient.age}
                      </td>
                      <td className='py-4 px-6 text-[#020e7c] whitespace-nowrap'>
                        {new Date(patient.callDate).toLocaleDateString()}  
                      </td>
                      <td
                        className={`py-4 px-6 whitespace-nowrap font-semibold ${
                          patient.callStatus === 'Attended'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {patient.callStatus}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

