

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 
import Modal from './SetTime'; 
import AppointmentRequests from './AppointmentRequests';

const CalendarPage = () => { 
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]); 
 

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleApply = () => {
    setModalOpen(true);
  };

  const handleCancel = () => {
    setSelectedDate(new Date()); 
  };

  const handleTimeConfirm = (time) => {
    const day = selectedDate.getDate().toString().padStart(2, '0'); 
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = selectedDate.getFullYear().toString().slice(-2);
    
    const hour = parseInt(time.hours, 10);
    const minutes = time.minutes.toString().padStart(2, '0');
    const amPm = time.amPm.toLowerCase();
    
    
    const formattedDate = `${day}/${month}/${year} - ${hour}:${minutes}${amPm}`;
    
    setAppointments([...appointments, {
      name: 'User Name', 
      condition: 'Checkup', 
      date: formattedDate,
      avatar: 'NewAvatarImageURL'
    }]);
    
    setModalOpen(false); 
  };

  return (

<div className='flex flex-row gap-4 rounded-xl w-[145%] justify-center items-center'>
  <AppointmentRequests appointments={appointments} />
  
  <div className='bg-white rounded-lg shadow-lg relative w-[120%] p-24 md:w-[80%] md:h-[420px] md:-left-2 md:p-8 sm:w-[350px] h-[470px] lg:w-[60%] lg:h-[420px] lg:p-4 lg:-left-2'>
    
    <div className='flex-grow'>
      <div className='grid grid-cols-2  justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold text-blue-900 ml-4 md:ml-0 lg:ml-0 '>Appointments</h2>
        
        <div className='grid justify-center text-blue-900 bg-transparent ml-3 border-none text-xl font-semibold focus:outline-none'>
          <option>Today</option>
        </div>
      </div>
      
     
      <div className='flex justify-center'>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          inline
          calendarClassName='custom-calendar'
          dayClassName={(date) => 
            'flex items-center justify-center w-[100%] h-[30px] rounded-md text-[14px] cursor-pointer hover:bg-[#e6f0ff] ' +
            (date.getDate() === new Date().getDate() && date.getMonth() === new Date().getMonth() 
              ? 'bg-red-600 text-white font-bold' 
              : '')
          }
        />
      </div>
      
    </div>

   
    <div className='absolute bottom-4 left-0 right-0 px-4 flex justify-between space-x-3 sm:space-x-4 lg:mr-9'>
      <button
        className='border-gray-500 border ml-20 md:ml-0 lg:ml-0  text-gray-700 w-[120px] h-[45px] font-semibold rounded-lg hover:bg-gray-200 transition duration-300 ease-in-out'
        onClick={handleCancel}
      >
        Cancel
      </button>
      
      <button
        className='bg-blue-900 text-white w-[120px] h-[45px] relative -left-14 md:-left-0 lg:-left-0  md:-right-0 lg:-right-0  font-semibold rounded-lg hover:bg-blue-800 transition duration-300 ease-in-out'
        onClick={handleApply}
      >
        Apply
      </button>
    </div>

    <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleTimeConfirm} />
  </div>
</div>

  );
};

export default CalendarPage;
