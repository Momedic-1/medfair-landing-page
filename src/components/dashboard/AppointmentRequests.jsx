
import React from 'react';
import AvatarImage from '../../assets/avatar.png';
import { IoCheckmarkCircle } from "react-icons/io5";
import { formatAppointmentDate, formatTime } from '../../utils';
function AppointmentRequests({ appointments }) {
  return (
    <div className='w-full h-[420px]  bg-white rounded-[10px] shadow-lg'>
      <div className='px-4 py-4'>
        <div className='flex justify-between text-[#020e7c]'>
          <span className="text-base font-semibold font-['Roboto'] leading-[25px]">
            Appointment Requests
          </span>
          <span className="text-xs font-bold font-['Roboto'] leading-[25px] cursor-pointer">
            View all
          </span>
        </div>

        {appointments.length > 0 ? (
          appointments.map((appointment, index) => (
            <div
              key={index}
              className='flex items-center justify-between px-4 bg-gray-100 rounded-lg mt-4 p-2'
            >
              <div className='flex-shrink-0'>
                <img
                  src={AvatarImage}
                  alt={`${appointment.name}'s avatar`}
                  className='w-8 h-8 rounded-full'
                />
              </div>
              <div className='flex-1 ml-2'>
                <div className="text-[#020e7c] text-[10px] font-normal font-['Roboto'] leading-[25px]">
                  {appointment.name}
                </div>
              </div>
              <div className="text-[#020e7c] text-[10px] font-normal font-['Roboto'] leading-[25px]">
                {formatAppointmentDate(appointment.date)}
              </div>
              <div className="text-[#020e7c] px-2 text-[10px] font-normal font-['Roboto'] leading-[25px]">
                {formatTime(appointment.time)}
              </div>
              {/* <div className='flex space-x-2 ml-2'>
     
                <div className='w-5 h-5 bg-white border border-[#020e7c] rounded-full flex justify-center items-center'>
               <IoCheckmarkCircle color='green' className='text-white' size={20}/>
                </div>

               
                <div className='w-5 h-5 bg-white border border-red-600 rounded-full flex justify-center items-center'>
                  <svg
                    width='12'
                    height='12'
                    viewBox='0 0 12 12'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    
                  </svg>
                </div>
              </div> */}
            </div>
          ))
        ) : (
          <div className="text-center text-blue-900 text-sm   ">No appointment requests yet.</div>
        )}
      </div>
    </div>
  );
}

export default AppointmentRequests;
