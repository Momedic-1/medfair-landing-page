import React, { useEffect, useState, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaChevronRight, FaChevronLeft, FaTimes } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import '../dashboard/Custompage.css';
import { Box, Modal } from '@mui/material';
import TimePicker from '../reuseables/TimePicker';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { baseUrl } from '../../env';
import axios from 'axios';
import { ColorRing } from 'react-loader-spinner';
import { getId, getToken } from '../../utils';
import {
  isDoctorProfileComplete,
  getMissingProfileFields,
} from '../../utils/doctorProfileComplete';

const  CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [open, setOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleDeleteModalOpen = () => setDeleteModalOpen(true);
  const handleDeleteModalClose = () => setDeleteModalOpen(false);
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [existingAppointments, setExistingAppointments] = useState([]);
  const doctorsId = getId();
  const token = getToken();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profilePayload, setProfilePayload] = useState(null);

  const profileComplete = isDoctorProfileComplete(profilePayload);
  const missingFields = getMissingProfileFields(profilePayload);

  const [calendarValue, setCalendarValue] = useState(new Date());

  const fetchDoctorProfile = useCallback(async () => {
    if (!doctorsId || !token) {
      setProfileLoading(false);
      return;
    }
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/doctor-profile/profile-full/${doctorsId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfilePayload(response.data);
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      setProfilePayload(null);
    } finally {
      setProfileLoading(false);
    }
  }, [doctorsId, token]);

  const promptCompleteProfile = () => {
    toast.info('Please complete your profile before creating appointment slots.');
    navigate('/doctor-dashboard/edit-profile');
  };

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
      const response = await axios.get(`${baseUrl}/api/appointments/available/${doctorsId}`, {
        // params: { doctorId: doctorsId },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      setExistingAppointments(response.data);
      localStorage.setItem('appointments', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctorProfile();
  }, [fetchDoctorProfile]);

  useEffect(() => {
    if (location.state?.profileUpdated) {
      fetchDoctorProfile();
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.profileUpdated, fetchDoctorProfile]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchDoctorProfile();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchDoctorProfile]);

  const handleDateChange = (date) => {
    if (profileLoading) {
      toast.info('Loading your profile — please try again in a moment.');
      return;
    }
    if (!profileComplete) {
      promptCompleteProfile();
      return;
    }
    setCalendarValue(date);
    setSelectedDate(date);
    handleOpen();
  };

  const hasAppointmentOnDate = (date) => {
    return existingAppointments.some(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  const getAppointmentsForSelectedDate = () => {
    return existingAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === selectedDate.toDateString();
    });
  };

  const formatAppointmentTime = (time) => {
    const [hour, minute] = time.split(':');
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleApply = async () => {
    if (!profileComplete) {
      promptCompleteProfile();
      return;
    }

    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    const formattedMinute = selectedMinute.toString().padStart(2, '0');
    const formattedHour = selectedHour.toString().padStart(2, '0');
    const time = `${formattedHour}:${formattedMinute}`;
    
    setIsLoading(true);
    const SUBSCRIBE_URL = `${baseUrl}/api/appointments/create?doctorId=${doctorsId}&date=${formattedDate}&times=${time}`;

    try {
      const response = await axios.post(SUBSCRIBE_URL, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (response.data) {
        await fetchAppointments();
        handleClose();
        toast.success('Appointment created successfully');
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
    setAppointmentToDelete(appointmentId);
    handleDeleteModalOpen();
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`${baseUrl}/api/appointments/${doctorsId}/slots/${appointmentToDelete}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchAppointments();
      toast.info('Appointment deleted successfully');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment. Please try again.');
    } finally {
      setIsDeleting(false);
      handleDeleteModalClose();
      setAppointmentToDelete(null);
    }
  };

  const calendarDisabled = ({ date: tileDate }) => isDateInPast(tileDate);

  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} />
      <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
          <h2 className="text-base font-bold text-[#020e7c] sm:text-lg">
            Your availability
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Select a date to add consultation slots
          </p>
        </div>
        <div className="p-3 sm:p-5">
          {!profileComplete && !profileLoading && (
            <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Complete your profile to create appointment slots.
              {missingFields.length > 0 && (
                <span className="block mt-1 text-xs text-amber-800">
                  Missing: {missingFields.join(', ')}
                </span>
              )}
            </p>
          )}
          <div className="relative flex justify-center">
            {profileLoading && (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/70"
                aria-busy="true"
                aria-label="Loading profile"
              >
                <ColorRing
                  visible
                  height="48"
                  width="48"
                  ariaLabel="loading-profile"
                  colors={['#020e7c', '#020e7c', '#020e7c', '#020e7c', '#020e7c']}
                />
              </div>
            )}
            <Calendar
              onChange={handleDateChange}
              value={calendarValue}
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
              tileDisabled={calendarDisabled}
              className="custom-calendar"
              style={calendarStyle}
            />
          </div>
        </div>
      </div>
      <div>
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
              width: 'min(100vw - 2rem, 420px)',
              maxHeight: '90vh',
              overflowY: 'auto',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: { xs: 2, sm: 4 },
              borderRadius: 2,
            }}
          >
            <div className="space-y-4">
              <p className="text-center text-sm font-semibold text-[#020e7c] sm:text-base">
                {formatAppointmentData}
              </p>

              {getAppointmentsForSelectedDate().length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Existing appointments:</p>
                  <div className="flex flex-wrap gap-2">
                    {getAppointmentsForSelectedDate().map((appointment, index) => (
                      <div 
                        key={index} 
                        className="appointment-time-button"
                      >
                        <span>{formatAppointmentTime(appointment.time)}</span>
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

              <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="h-11 w-full rounded-lg border border-gray-300 font-semibold text-gray-700 transition hover:bg-gray-100 sm:w-[120px]"
                  onClick={handleClose}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="h-11 w-full rounded-lg bg-[#020e7c] font-semibold text-white transition hover:bg-blue-800 sm:w-[120px]"
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

        <Modal
          open={deleteModalOpen}
          onClose={handleDeleteModalClose}
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-description"
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
              <h2 className="text-xl font-semibold text-gray-800">Delete Appointment</h2>
              <p className="text-gray-600">Are you sure you want to delete this appointment?</p>
              
              <div className='w-full px-4 flex flex-col lg:flex-row justify-between gap-y-4 lg:gap-x-3 lg:mr-9'>
                <button
                  className='border-gray-500 border lg:ml-0 text-gray-700 w-full lg:w-[120px] h-[45px] font-semibold rounded-md hover:bg-gray-200 transition duration-300 ease-in-out'
                  onClick={handleDeleteModalClose}
                  disabled={isDeleting}
                >
                  Cancel
                </button>

                <button
                  className='bg-red-600 border lg:ml-0 text-white w-full lg:w-[120px] h-[45px] font-semibold rounded-md hover:bg-red-700 transition duration-300 ease-in-out'
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ColorRing
                      visible={true}
                      height="40"
                      width="40"
                      ariaLabel="color-ring-loading"
                      wrapperStyle={{}}
                      wrapperClass="color-ring-wrapper"
                      colors={['white', 'white', 'white', 'white', 'white']}
                    />
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
    </>
  );
};

export default CalendarPage;
