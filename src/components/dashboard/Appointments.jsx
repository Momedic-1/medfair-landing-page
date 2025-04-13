import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaChevronRight, FaChevronLeft, FaTimes } from 'react-icons/fa';
import '../dashboard/Custompage.css';
import AppointmentRequests from './AppointmentRequests';
import { Box, Modal } from '@mui/material';
import TimePicker from '../reuseables/TimePicker';
import { baseUrl } from '../../env';
import axios from 'axios';
import { ColorRing } from 'react-loader-spinner';
import { getId, getToken } from '../../utils';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [existingAppointments, setExistingAppointments] = useState([]);
  const doctorsId = getId();
  const token = getToken();
  const [isDeleting, setIsDeleting] = useState(false);

  const date = new Date();

  const calendarStyle = {
    width: '100%',
    maxWidth: '100%',
    height: '100%',
    backgroundColor: 'white',
    border: 'none',
    fontFamily: 'inherit'
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/appointments/available`, {
        params: { doctorId: doctorsId?.id },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      setExistingAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    handleOpen();
  };

  const hasAppointmentOnDate = (date) => {
    return existingAppointments.some(appointment => {
      const appointmentDate = new Date(appointment.dateTime);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  const getAppointmentsForSelectedDate = () => {
    return existingAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.dateTime);
      return appointmentDate.toDateString() === selectedDate.toDateString();
    });
  };

  const formatAppointmentTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleApply = async () => {
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    const formattedMinute = selectedMinute.toString().padStart(2, '0');
    const formattedHour = selectedHour.toString().padStart(2, '0');
    const appointmentData = {
      doctorId: doctorsId.id,
      date: formattedDate,
      time: `${formattedHour}:${formattedMinute}`,
    };
    
    setIsLoading(true);
    const SUBSCRIBE_URL = `${baseUrl}/api/appointments/create`;

    try {
      const response = await axios.post(SUBSCRIBE_URL, appointmentData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (response.data) {
        await fetchAppointments();
        handleClose();
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      setIsDeleting(true);
      try {
        await axios.delete(`${baseUrl}/api/appointments/${doctorsId.id}/slots/${appointmentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        await fetchAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Failed to delete appointment. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className='flex flex-col md:flex-row gap-4 rounded-xl w-full justify-center items-center'>
      <div className='bg-white rounded-lg shadow-lg relative w-full h-[420px]'>
        <div className='w-[100%] px-2'>
          <div className='flex flex-col mb-4 w-full py-2 px-1 md:py-4 md:px-4'>
            <h2 className='text-lg font-bold text-blue-900 md:text-xl'>Appointments</h2>
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
                if (hasAppointmentOnDate(date)) {
                  return 'has-appointment';
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
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <div className="space-y-4">

              {getAppointmentsForSelectedDate().length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Existing appointments:</p>
                  <div className="flex flex-wrap gap-2">
                    {getAppointmentsForSelectedDate().map((appointment, index) => (
                      <div 
                        key={index} 
                        className="appointment-time-button"
                      >
                        <span>{formatAppointmentTime(appointment.dateTime)}</span>
                        <button 
                          onClick={() => handleDeleteAppointment(appointment.slotId)}
                          className="delete-appointment-btn"
                          disabled={isDeleting}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <TimePicker
                  selectedHour={selectedHour}
                  setSelectedHour={setSelectedHour}
                  selectedMinute={selectedMinute}
                  setSelectedMinute={setSelectedMinute}
                />
              </div>

              <div className='w-full px-4 flex flex-col lg:flex-row justify-between gap-y-4 lg:gap-x-3 lg:mr-9'>
                <button
                  className='border-gray-500 border lg:ml-0 text-gray-700 w-full lg:w-[120px] h-[45px] font-semibold rounded-md hover:bg-gray-200 transition duration-300 ease-in-out'
                  onClick={handleClose}
                >
                  Cancel
                </button>

                <button
                  className='bg-blue-900 border lg:ml-0 text-white w-full lg:w-[120px] h-[45px] font-semibold rounded-md hover:bg-blue-400 transition duration-300 ease-in-out'
                  onClick={handleApply}
                >
                  {isLoading ?
                    <ColorRing
                      visible={true}
                      height="40"
                      width="40"
                      ariaLabel="color-ring-loading"
                      wrapperStyle={{}}
                      wrapperClass="color-ring-wrapper"
                      colors={['white', 'white', 'white', 'white', 'white']}
                    /> :
                    'Schedule'
                  }
                </button>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default CalendarPage;
