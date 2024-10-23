
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import CSS for date picker
import Modal from './SetTime'; 

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState('September 2023');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [appointmentTime, setAppointmentTime] = useState('');

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
    const formattedDate = `${selectedDate.getDate()} - ${time.hours}:${time.minutes}:${time.seconds} ${time.amPm}`;
    setAppointmentTime(formattedDate); 
    setModalOpen(false); 
  };

  return (
    <div className='bg-white rounded-lg  space-y-5 mt-4 shadow-lg   relative sm:w-[350px] w-full h-[420px] flex flex-col lg:ml-8 p-4'>
      <div className='flex-grow'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-lg font-bold text-blue-900'>Appointments</h2>
          <select className='text-blue-900 bg-transparent border-none text-sm font-semibold focus:outline-none'>
            <option>Today</option>
          </select>
        </div>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-md font-semibold text-blue-900'>{currentMonth}</h2>
        </div>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          inline
          className='border rounded-lg w-full'
        />
      </div>
      <div className='absolute bottom-4 left-0 right-0 px-4 flex justify-between'>
        <button
          className=' border-gray-500 border text-gray-700 w-[120px] h-[45px] font-semibold rounded-lg hover:bg-gray-200 transition duration-300 ease-in-out'
          onClick={handleCancel}
        >
          Cancel
        </button>
        <button
          className='bg-blue-700 text-white w-[120px] h-[45px] font-semibold rounded-lg hover:bg-blue-800 transition duration-300 ease-in-out'
          onClick={handleApply}
        >
          Apply
        </button>
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={handleTimeConfirm} />
    </div>
  );
};

export default Calendar;
