

import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css'; 
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa'; 
import '../dashboard/Custompage.css'; 
import AppointmentRequests from './AppointmentRequests';
import { Box, Modal } from '@mui/material';
import TimePicker from '../reuseables/TimePicker';
import { baseUrl } from '../../env';
import axios from 'axios';
import { ColorRing } from 'react-loader-spinner';


const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [selectedHour, setSelectedHour] = useState(12);
    const [selectedMinute, setSelectedMinute] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const doctorsId = JSON.parse(localStorage.getItem('userData'))
  const token = JSON.parse(localStorage.getItem('authToken'));


  const date =new Date(); 
  
  const calendarStyle = {
  width: '100%', 
  maxWidth: '100%',
  height: '100%',
  backgroundColor: 'white',
  border: 'none', 
  fontFamily: 'inherit'
};
  console.log(selectedDate, 'selectedDate');
  const handleDateChange = (date) => {
    setSelectedDate(date);
    handleOpen()
  };




  const handleApply = async () => {
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    const formattedMinute = selectedMinute.toString().padStart(2, '0');
    const appointmentData = {
      doctorId: doctorsId.id,
      date: formattedDate,
      time: `${selectedHour}:${formattedMinute}`,
    }
    setIsLoading(true)
const SUBSCRIBE_URL=`${baseUrl}/api/appointments/create?doctorId=${doctorsId.id}&date=${appointmentData.date}&time=${appointmentData.time}`


   try {
      const response = await axios.post(SUBSCRIBE_URL, appointmentData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token?.token}`

        },
      });
      console.log('Appointment created:', response.data);
      handleClose()
    } catch (error) {
      console.error('Error creating appointment:', error);
      setIsLoading(false)
    }
    finally{
      setIsLoading(false)
      handleClose()
    }

    console.log(appointmentData, 'appointmentData');
  };


  const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatAppointmentData = selectedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className='flex flex-col md:flex-row gap-4 rounded-xl w-full justify-center items-center'>

      <div className='bg-white rounded-lg shadow-lg relative w-full h-[490px]'>
        <div className='w-[100%] px-2'>
          <div className='flex flex-col mb-4 w-full py-2 px-1 md:py-4 md:px-4'>
            <h2 className='text-lg font-bold text-blue-900 md:text-xl'>Appointments</h2>
            <p className="text-gray-950/60 text-sm md:text-lg">you can schedule a date and time for your appointment</p>
            
      
          </div>  
     
          <div className='flex justify-center w-full h-full'>
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
              tileDisabled={({ date }) => isDateInPast(date)}
              className="custom-calendar"
              style={calendarStyle} 
            />
          </div>
        </div>

      </div>
      <div className=''>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box 
        sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <p id="modal-modal-title" className='text-lg font-semibold text-gray-900'>
            You are about to schedule an appointment on <span className='text-gray-900n font-extrabold text-lg'>
              {formatAppointmentData}
              </span>
          </p>
          <div>
          
      <TimePicker selectedHour={selectedHour} setSelectedHour={setSelectedHour} selectedMinute={selectedMinute} setSelectedMinute={setSelectedMinute}/>
   
          </div>
          
        <div className='px-4 flex justify-between space-x-3 sm:space-x-4 lg:mr-9'>
          <button
            className='border-gray-500 border ml-[25%] md:ml-[10%] lg:ml-0  text-gray-700 w-[120px] h-[45px] font-semibold rounded-md hover:bg-gray-200 transition duration-300 ease-in-out'
            onClick={handleClose}
          >
            Cancel
          </button>

          <button
            className='bg-blue-900 text-white w-[120px] h-[45px] relative -left-[25%]  lg:-left-0  md:-left-[20%] lg:-right-0  font-semibold rounded-lg hover:bg-blue-800 transition duration-300 ease-in-out'
            onClick={handleApply}
          >
            {isLoading ?  
            <ColorRing  visible={true}
              height="40"
              width="40"
              ariaLabel="color-ring-loading"
              wrapperStyle={{}}
              wrapperClass="color-ring-wrapper"
              colors={['white', 'white', 'white', 'white', 'white']}
              /> : 
              'Schedule'}
          </button>
        </div>
        </Box>
      </Modal>
    </div>
    </div>
  );
};

export default CalendarPage;
