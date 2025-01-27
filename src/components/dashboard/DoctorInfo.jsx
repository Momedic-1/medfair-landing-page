import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MdDelete } from 'react-icons/md';
import { baseUrl } from '../../env';
import AppointmentsSkeleton from '../reuseables/AppointmentSkeleton';
import ConfirmationMenu from '../reuseables/ConfirmationMenu';
import { getToken } from '../../utils';

const DoctorInfo = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const getDoctorData = () => ({
    doctorsId: JSON.parse(localStorage.getItem('userData')),
    token: getToken()
  });

  const getAppointments = async () => {
    const { doctorsId, token } = getDoctorData();
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(`${baseUrl}/api/appointments/available`, {
        params: { doctorId: doctorsId?.id },
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      const sortedAppointments = response.data.sort(
        (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
      );
      setAppointments(sortedAppointments);
    } catch (error) {
      const errorMessage = error.response?.status === 403 
        ? 'Session expired. Please login again.'
        : 'Failed to fetch appointments. Please try again later.';
      setError(errorMessage);
      console.error('Error fetching appointments:', error.response || error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    const { token } = getDoctorData();
    try {
      await axios.delete(`${baseUrl}/api/appointments/${doctorId}/slots/${slotId}`, {
       headers: { 'Authorization': `Bearer ${token}` },
      });
      setAppointments(appointments.filter(apt => apt.id !== appointmentId));
    } catch (error) {
      setError('Failed to delete appointment. Please try again.');
      console.error('Error deleting appointment:', error);
    }
  };

  useEffect(() => {
 
    getAppointments();
  }, []); 

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return {
      formattedDate: date.toLocaleDateString('en-US', options),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (isLoading) {
    return (
      <AppointmentsSkeleton />
    );
  }

  return (
    <div className="w-full bg-white rounded-lg h-[480px]">
      <div className="w-full h-full overflow-y-auto px-8 xl:px-10 py-8">
        <p className="text-sm text-gray-950/60 underline leading-8 font-bold">
          Your scheduled appointments
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {!error && appointments.length === 0 && (
          <div className="w-full h-[300px] flex items-center justify-center">
            <p className="text-gray-800/60 font-semibold text-xl">
              You have no appointments scheduled
            </p>
          </div>
        )}

        {!error && appointments.map((appointment) => {
          const { formattedDate, time } = formatDate(appointment.dateTime);
          return (
            <div
              key={appointment.id}
              className="mb-4 flex items-center justify-between border-b border-gray-200 py-2 mt-4"
            >
              <div className="flex items-center gap-x-4">
                <p className="text-gray-800 text-sm font-semibold">{formattedDate}</p>
                <p className="text-gray-600 text-sm font-semibold">{time}</p>
              </div>

              <div className="relative group">
                <button
                  onClick={handleClick}
                  className="text-gray-500/80 text-lg hover:text-red-500 transition-colors duration-200"
                  aria-label="Delete appointment"
                >
                  <MdDelete />
                </button>
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-blue-400 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Delete appointment
                </span>
                <ConfirmationMenu anchorEl={anchorEl} handleClose={handleClose} open={open}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DoctorInfo;