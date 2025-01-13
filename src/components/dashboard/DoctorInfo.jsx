import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { baseUrl } from '../../env';
import { MdDelete } from 'react-icons/md';


const DoctorInfo = () => {

  const [appointments, setAppointments] = useState([]);
  const doctorsId = JSON.parse(localStorage.getItem('userData'))
  const token = JSON.parse(localStorage.getItem('authToken'));

  const getAppointments = async () => {
  //  try {
  //     const response = await axios.get(`${baseUrl}/api/appointments?doctorId=${doctorsId.id}`, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //       },
  //     });
  //     const sortedAppointments = response.data.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  //     setAppointments(sortedAppointments);
  //   } catch (error) {
  //     console.error('Error fetching appointments:', error);
  //   }
  try {
      const response = await axios.get(`${baseUrl}/api/appointments?doctorId=${doctorsId.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const sortedAppointments = response.data.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
      setAppointments(sortedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(()=> {
    getAppointments()
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return { formattedDate, time };
  };

  console.log(appointments, 'appointments');

  return (
    <div className="w-full bg-white rounded-lg h-[480px]">
      <div className="w-full h-full overflow-y-auto px-16 py-8">
        <p className='text-lg text-gray-950/60 underline leading-8 font-bold'>Your scheduled appointments</p>

        {appointments.map((appointment) => {
          const { formattedDate, time } = formatDate(appointment.dateTime);
          return (
            <div key={appointment.id} className="mb-4 flex items-center justify-between border-b border-gray-200 py-2 mt-4">
              <div className='flex items-center gap-x-4'>
                <p className="text-gray-800 font-semibold">{formattedDate}</p>
              <p className="text-gray-600 font-semibold">{time}</p>
              </div>
           
              <div className="relative group">
                <button
                  className='text-gray-500/80 text-lg hover:text-red-500'
                >
                  <MdDelete />
                </button>
                <span className="absolute bottom-full left-0 transform -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-blue-400 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Delete appointment
                </span>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  )
}

export default DoctorInfo