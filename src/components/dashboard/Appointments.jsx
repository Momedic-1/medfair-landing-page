

import React, { useState } from 'react';
import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css'; 
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa'; 
import '../dashboard/Custompage.css'; 
import Modal from './SetTime'; 
import AppointmentRequests from './AppointmentRequests';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState(new Date()); 
  

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
    <div className='flex flex-row gap-4 rounded-xl w-[255%] justify-center items-center'>
      <AppointmentRequests appointments={appointments} className="" />
      
      <div className='bg-white rounded-lg shadow-lg relative w-[100%] h-[620px]  p-24 md:w-[25%] md:h-[490px] md:-left-2 md:p-8 sm:w-[350px]  lg:w-[42%] lg:h-[450px] lg:p-4 ]'>
        <div className='flex-grow'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl font-bold text-blue-900 ml-[20%] md:ml-0 lg:ml-0 '>Appointments</h2>
            
            <select className='text-blue-900 bg-transparent mr-[17%] lg:mr-2 border-none text-xl font-semibold focus:outline-none'>
              <option>Today</option>
            </select>
          </div>
     
          <div className='flex justify-center w-full lg:w-[90%] md:w-[90%] sm:w-[90%] ml-0 lg:ml-0 md:ml-0 '>
            <Calendar
              onChange={handleDateChange} 
              value={date} 
              nextLabel={<FaChevronRight />}
              prevLabel={<FaChevronLeft />}
              navigationLabel={({ date }) =>
                `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`
              }
              tileClassName={({ date }) => {
                const day = date.getDate();
                if (day === 30 || day === 31) {
                  return 'last-days';
                }
                if (date.toDateString() === new Date().toDateString()) {
                  return 'current-day';
                }
                if (date.getTime() === selectedDate.getTime()) {
                  return 'selected-day';
                }
                return '';
              }}
              className='custom-calendar' 
            />
          </div>
        </div>

        <div className='absolute bottom-4 left-0 right-0 px-4 flex justify-between space-x-3 sm:space-x-4 lg:mr-9'>
          <button
            className='border-gray-500 border ml-[25%] md:ml-[10%] lg:ml-0  text-gray-700 w-[120px] h-[45px] font-semibold rounded-md hover:bg-gray-200 transition duration-300 ease-in-out'
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button
            className='bg-blue-900 text-white w-[120px] h-[45px] relative -left-[25%]  lg:-left-0  md:-left-[20%] lg:-right-0  font-semibold rounded-lg hover:bg-blue-800 transition duration-300 ease-in-out'
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
