import React, { useEffect, useState } from 'react';
import Cards from '../components/reuseables/Cards';
import call from './assets/call (2).svg';
import calendarIcon from "../assets/calendarIcon.jpeg";
import testTube from "../assets/test.jpeg";
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Modal, Box, List, ListItem, ListItemButton, ListItemText, Avatar, Button, Popover } from '@mui/material';
import { baseUrl } from '../env';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ColorRing } from 'react-loader-spinner';
import { formatSpecialization, formatTime, getPatientId, getToken, transformName } from '../utils';
import Skeleton from 'react-loading-skeleton';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "react-loading-skeleton/dist/skeleton.css"; 

const localizer = dayjsLocalizer(dayjs);

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  height: 500,
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};


 const specialistCategory = [
    { id: 1, name: 'Psychiatrist', count: 0, icon: '🧠', specialization: 'PSYCHIATRIST' },
    { id: 2, name: 'Clinical Psychologist', count: 0, icon: '🎯', specialization: 'CLINICAL_PSYCHOLOGIST' },
    { id: 3, name: 'Therapist', count: 0, icon: '💭', specialization: 'THERAPIST' },
    { id: 4, name: 'Sex Therapist', count: 0, icon: '❤️', specialization: 'SEX_THERAPIST' },
  ];

const specialists = {
  1: [
    { id: 1, name: 'Dr. Sarah Smith', specialty: 'Family Medicine',time: ['2:00 PM', '3:00 PM', '4:00 PM'] },
    { id: 2, name: 'Dr. James Johnson', specialty: 'Internal Medicine',time: ['2:00 PM', '3:00 PM', '4:00 PM'] },
    { id: 3, name: 'Dr. James Johnson', specialty: 'Internal Medicine',time: ['2:00 PM', '3:00 PM', '4:00 PM'] },
    { id: 4, name: 'Dr. James Johnson', specialty: 'Internal Medicine',time: ['2:00 PM', '3:00 PM', '4:00 PM'] },
    { id: 5, name: 'Dr. James Johnson', specialty: 'Internal Medicine',time: ['2:00 PM', '3:00 PM', '4:00 PM'] },
    { id: 6, name: 'Dr. James Johnson', specialty: 'Internal Medicine',time: ['2:00 PM', '3:00 PM', '4:00 PM'] },
    { id: 7, name: 'Dr. James Johnson', specialty: 'Internal Medicine',time: ['2:00 PM', '3:00 PM', '4:00 PM'] },
  ],
  2: [
    { id: 1, name: 'Dr. Michael Brown', specialty: 'Interventional Cardiology',time: ['2:00 PM'] },
    { id: 2, name: 'Dr. Emily Davis', specialty: 'Clinical Cardiology',time: ['2:00 PM'] },
  ],
  3: [
    { id: 1, name: 'Dr. Lisa Wilson', specialty: 'Medical Dermatology',time: ['2:00 PM'] },
    { id: 2, name: 'Dr. Robert Taylor', specialty: 'Surgical Dermatology',time: ['2:00 PM'] },
  ],
  4: [
    { id: 1, name: 'Dr. David Miller', specialty: 'Sports Medicine',time: ['2:00 PM'] },
    { id: 2, name: 'Dr. Jennifer Lee', specialty: 'Joint Reconstruction',time: ['2:00 PM' ]},
  ],
};



const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [specialist, setSpecialist] = useState([]);
  const[specialistCategories, setSpecialistCategories] = useState(specialistCategory);
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [isSpecialistsModalOpen, setIsSpecialistsModalOpen] = useState(false);
  const [isCallADoctorModalOpen, setIsCallADoctorModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [videoLink, setVideoLink] = useState(null);
const [specialistDetails, setSpecialistDetails] = useState([]);
 const token = getToken() 
const [selectedTime, setSelectedTime] = useState(null);
const [selectedDoctor, setSelectedDoctor] = useState(null);
const [selectedSlotId, setSelectedSlotId] = useState(null);
const [isBooking, setIsBooking] = useState(false);
const [anchorEl, setAnchorEl] = useState(null);

const navigate = useNavigate();


  // const [appointments, setAppointments] = useState({
  //   '2025-01-15': { time: '2:00 PM', description: 'Doctor Appointment',doctors: 'Dr. Sarah Smith' },
  //   '2025-01-20': { time: '11:00 AM', description: 'Meeting', doctors: 'Dr. James Johnson' },
  // });

  const patientId = getPatientId()


  const CREATE_MEETING = `${baseUrl}/api/v1/video/create-meeting`;
  const GETSPECIALISTCOUNTURL = `${baseUrl}/api/appointments/specialists/appointments-count`;
  const GETSPECIALISTDATA = `${baseUrl}/api/appointments/specialists/slots`;
  const GETUPCOMINGAPPOINTMENTS = `${baseUrl}/api/appointments/upcoming/patient`;
  const BOOK_APPOINTMENT_URL = `${baseUrl}/api/appointments/book`;


  const myEventsList = [
    {
      title: 'Doctor Appointment',
      start: new Date(2025, 0, 15, 14, 0),
      end: new Date(2025, 0, 15, 15, 0),
    },
    {
      title: 'Meeting',
      start: new Date(2025, 0, 20, 11, 0),
      end: new Date(2025, 0, 20, 12, 0),
    },
  ];

  const handleCardClick = (title) => {
    if (title === "Schedule an Appointment with a Specialist") {
      setIsMainModalOpen(true);
    }
  };

  const handleCallADoctorClick = async() => {
    setIsCallADoctorModalOpen(true);
    
    };

   const handleOpenPopover = (event, doctor, slotTime, slotId) => {
  setAnchorEl(event.currentTarget);
  setSelectedTime(slotTime);
  setSelectedDoctor(doctor);
  setSelectedSlotId(slotId); 
};

const handleClosePopover = () => {
  setAnchorEl(null);
  setSelectedTime(null);
  setSelectedDoctor(null);
};

 const handleCategoryClick = (categoryId) => {
  const category = specialistCategories.find(cat => cat.id === categoryId);
  setSelectedCategory(categoryId);
  getSpecialistsDetails(category.name);
  setIsSpecialistsModalOpen(true);
};


const handleBookAppointment = async (e, slotId, patientId) => {
  e.preventDefault()
  setIsBooking(true);
  try {
    

    await axios.post(`${BOOK_APPOINTMENT_URL}?slotId=${slotId}&patientId=${patientId}`, {
       headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      }
    });
    
    toast.success('Appointment booked successfully!');

    handleClosePopover();
    setIsSpecialistsModalOpen(false);
    setIsMainModalOpen(false);
    getUpcomingAppointments();

    setSpecialistDetails(prev => prev.map(doctor => {
      if (doctor.id === selectedDoctor.id) {
        return {
          ...doctor,
          slots: doctor.slots.filter(slot => slot !== selectedTime)
        };
      }
      return doctor;
    }));

  } catch (error) {
    toast.error('Failed to book appointment');
    console.error('Booking error:', error);
  } finally {
    setIsBooking(false);
  }

};

 const getSpecialistCount = async () => {
  try {
    setIsLoading(true);
    const response = await axios.get(GETSPECIALISTCOUNTURL, {
       headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("Specialist count response:", response?.data);

    const countData = response?.data || {};

    const normalizedCountData = Object.keys(countData).reduce((acc, key) => {
      acc[key.toUpperCase()] = countData[key];
      return acc;
    }, {});
    const updatedCategories = specialistCategories.map(category => ({
      ...category,
      count: normalizedCountData[category.specialization] || 0,
    }));

    setSpecialistCategories(updatedCategories);
  } catch (error) {
    console.error("Error fetching specialist count:", error);
  } finally {
    setIsLoading(false);
  }
};


const getSpecialistsDetails = async (categoryName) => {
   setIsLoading(true);
  try {
    const transformedName = transformName(categoryName);
    const response = await axios.get(`${GETSPECIALISTDATA}?specialization=${transformedName}`, {
       headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      }
    });
    const parsedResponse = response?.data || {}; 
    const specialists = Object.values(parsedResponse).flat(); 

    setSpecialistDetails(specialists);

   
    setIsLoading(false);
  } catch (error) {
    console.error('Error fetching specialists:', error);
    setIsLoading(false);
  }
};

const getUpcomingAppointments = async () => {
  setIsLoading(true);
  try {
    const response = await axios.get(`${GETUPCOMINGAPPOINTMENTS}/${patientId}`, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      }
    });
    const formattedData = response.data;
    setUpcomingAppointments(formattedData);
    setIsLoading(false);
  } catch (error) {
    console.log('Error fetching upcoming appointments:', error);
    setIsLoading(false);
  }
}

  const createMeeting = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      
      if (!patientId) {
        throw new Error('Patient ID not found');
      }
      
      const response = await axios.post(`${CREATE_MEETING}?patientId=${patientId}`, {}, {
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      }
    });
      
  
      setVideoLink(response.data);
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create meeting');
      toast.error(err.response?.data?.error);
      
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(()=> {
    getSpecialistCount()
  
  }, [])
  useEffect(()=> {
    setSpecialist(specialists)
  
  }, [])
  useEffect(()=> {
    getUpcomingAppointments()
  
  }, [])


  return (
    <div className='w-full'>
      <ToastContainer />
      <div className='w-full px-4 py-8 overflow-hidden'>
        <div className="w-full grid grid-cols-1 gap-x-8 md:grid-cols-2 lg:grid-cols-3 md:gap-8 mt-4">
          <div onClick={handleCallADoctorClick}>
            <Cards title="Call a Doctor" img={call} />
          </div>
          <div onClick={() => handleCardClick("Schedule an Appointment with a Specialist")}>
            <Cards title="Schedule an Appointment with a Specialist" img={calendarIcon} />
          </div>
          <div onClick={() => handleCardClick("Get your test done")}>
            <Cards title="Get your test done" img={testTube} />
          </div>
        </div>

        <div className="w-full mt-6 py-4 bg-gray-100 flex flex-col gap-y-6 lg:gap-y-0 lg:flex-row items-start gap-x-8 px-1">
          <div className='w-full lg:w-[76%] rounded-lg border bg-white border-gray-200 p-4'>
            <Calendar
              localizer={localizer}
              events={myEventsList}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 400, color: 'gray', fontSize: 18, textAlign: 'center' }}
            />
          </div>
          <div className='w-full lg:w-[24%] h-[400px] rounded-lg border overflow-y-auto bg-white border-gray-200 p-4'>
            <h2 className='text-lg font-bold text-blue-900 md:text-xl'>Appointments</h2>
            <p className='text-gray-950/60 text-sm'>View your upcoming appointments</p>
            {
            isLoading ? (
              Array(3).fill(0).map((_, index) => (
              <div className="mt-4 p-3 border rounded-lg animate-pulse" key={index}>
      <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-2/5"></div>
    </div>))
            )
            :
            upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((details, index) => (
              <div key={index} className="mt-4 p-3 border rounded-lg">
                <p className="font-medium">{details.date}</p>
                <p className="text-sm text-gray-600">{formatTime(details.time)}</p>
                
                <p className="text-sm">{details.doctors}</p>
              </div>
            ))): (
              <div className="text-center text-gray-600 text-sm p-4">
                No upcoming appointments
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal
        open={isMainModalOpen}
        onClose={() => setIsMainModalOpen(false)}
        aria-labelledby="category-modal-title"
      >
        <Box sx={modalStyle}>
          <div className="w-full flex justify-between items-center mb-4">
          <p className='text-2xl text-gray-950/60 font-semibold'>Choose Specialist</p>
            
            <button 
              onClick={() => setIsMainModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <span className="text-gray-500">✕</span>
            </button>
          </div>
          {specialistCategories.map((category) => (

            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="w-full p-4 mb-4 hover:bg-blue-50 rounded-xl transition-colors border border-gray-100 hover:border-blue-100 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-500">{category.count} specialists available</div>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-blue-500 transition-colors">→</span>
              </div>
            </button>
          ))}
        </Box>
      </Modal>
      <Modal
        open={isSpecialistsModalOpen}
        onClose={() => setIsSpecialistsModalOpen(false)}
        aria-labelledby="specialists-modal-title"
      >
        <Box sx={modalStyle}>
          <div className="w-full flex justify-between items-center mb-4">
           <p className='mb-1 text-2xl text-gray-950/60 font-semibold'>
            Available Specialists
          </p>
            
            <button 
              onClick={() => setIsSpecialistsModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <span className="text-gray-500">✕</span>
            </button>
          </div>
         
          <List sx={{ width: '100%', height:200, bgcolor: 'background.paper' }}>
            {isLoading ? (
   Array(5).fill(0).map((_, index) => (
      <ListItem key={index} disablePadding>
        <ListItemButton>
          <div className="flex items-center justify-between w-full">
            <div className="w-[10%]">
              <Skeleton circle={true} height={50} width={50} />
            </div>
            <div className="w-[50%]">
              <Skeleton height={20} width="80%" />
              <Skeleton height={14} width="60%" style={{ marginTop: 6 }} />
            </div>
            <div className="w-[40%]">
              <Skeleton height={20} width="100%" />
            </div>
          </div>
        </ListItemButton>
      </ListItem>
    ))
  ) : 
             
              specialistDetails?.length > 0 ? (
            specialistDetails.map((specialist) => (
              <ListItem key={specialist.slotId} disablePadding>
                <ListItemButton >
                <div className='flex items-center justify-between w-full'>
                  <div className='w-[10%]'>
                    {
                      specialist.image != null ? (
                        <Avatar src={specialist?.image} />
                      ) : (
                        <Avatar src="/broken-image.jpg"  />
                      )
                    }
                  </div>
                  <div className="w-[50%]">

                  <ListItemText 
                 
                    primary={specialist?.doctorName}
                    secondary={formatSpecialization(specialist?.specialization)}
                  />
                  </div>
                  <div className='w-[40%] flex items-center gap-x-2'>
                  <ListItemText primary={
                 specialist.slots?.length > 0 ? (
  specialist.slots
    .slice()

    .filter(slot => dayjs(slot.time).isSame(dayjs(), 'day'))

    .sort((a, b) => dayjs(a.time).valueOf() - dayjs(b).valueOf())
    .map((slot, index, filteredSlots) => (
      <React.Fragment key={slot.slotId}>
        <button 
          className='text-blue-800 text-sm ml-2 cursor-pointer'
          onClick={(e) => handleOpenPopover(e, specialist, slot.time, slot.slotId)}
        >
          <span>
            {dayjs(slot?.time).format('h:mm A')}
          </span>
        </button>
        {index < filteredSlots.length - 1 ? " | " : ""}
      </React.Fragment>
    ))
) : (
  "No slots available today"
)
                }
               sx={{color: "grey"}}/>
                 
                  </div>
                  </div>
                </ListItemButton>
              </ListItem>
            )) 
          
            
          ) 
          : (
            <div className='w-full h-[300px] flex justify-center items-center'>

                <p className='text-2xl text-gray-950/60'>
                  No specialists available
                </p>
              </div>
          )
            }
          </List>
        </Box>
      </Modal>
      <Modal
        open={isCallADoctorModalOpen}
        onClose={() => setIsCallADoctorModalOpen(false)}
        aria-labelledby="specialists-modal-title"
      >
        <Box sx={{width: 400, height: 200, overflowY: 'auto', bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2, position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)'}}>
          <div className="w-full h-full flex flex-col gap-y-8 px-4">
          {videoLink === null ? <>
            <p className='text-lg text-center font-medium'>Want to call a doctor?</p>
          <button className="bg-blue-500 flex justify-center items-center w-full h-14 text-white rounded-full" onClick={createMeeting}>
            {isLoading ? 
            <ColorRing height="40"
            width="40"
            ariaLabel="color-ring-loading"
            wrapperStyle={{}}
            wrapperClass="color-ring-wrapper"
            colors={['white', 'white', 'white', 'white', 'white']} 
              /> 
  : 'Create Meeting'}
          </button>
          </>
           : <div className='w-full h-full flex flex-col gap-y-4'>
            <p className='text-xl font-medium'>Your meeting link is:</p>
            <a href={videoLink?.roomUrl} className='text-[12px] cursor-pointer font-medium text-blue-800'>{videoLink?.roomUrl}</a>
            <Link to={videoLink?.roomUrl}>
             <button className="bg-blue-500 w-full h-10 text-white rounded-full">
              
              Click to join a call
            </button>
            </Link>
           

           </div> }
          </div>
        </Box>
      </Modal>
      <Popover
  open={Boolean(anchorEl)}
  anchorEl={anchorEl}
  onClose={handleClosePopover}
  anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'center',
  }}
  transformOrigin={{
    vertical: 'top',
    horizontal: 'center',
  }}
>
  <div className="p-4">
    <p>
      Confirm booking with <span className='font-bold'>
        {selectedDoctor?.doctorName}
        </span>
    </p>
    <p className='font-bold' >
      {selectedTime && dayjs(selectedTime).format('MMMM D, YYYY [at] h:mm A')}
    </p>
    <div className="flex justify-end gap-2 mt-3">
      <Button 
        variant="outlined" 
        size="small"
        onClick={handleClosePopover}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={(e)=>handleBookAppointment(e, selectedSlotId, patientId)}
        disabled={isBooking}
      >
        {isBooking ? <ColorRing height="20"
            width="20"
            ariaLabel="color-ring-loading"
            wrapperStyle={{}}
            wrapperClass="color-ring-wrapper"
            colors={['white', 'white', 'white', 'white', 'white']} 
              />  : 'Confirm'}
              
      </Button>
    </div>
  </div>
      </Popover>
    </div>
  );
};

export default Dashboard;