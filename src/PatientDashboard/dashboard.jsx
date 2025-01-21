// import React, { useState } from 'react'
// import Cards from '../components/reuseables/Cards'
// import call from './assets/call (2).svg';
// import calendarIcon from "../assets/calendarIcon.jpeg";
// import testTube from "../assets/test.jpeg"
// import { Calendar, dayjsLocalizer,  } from 'react-big-calendar'
// import dayjs from 'dayjs';
// import "react-big-calendar/lib/css/react-big-calendar.css"

// const localizer = dayjsLocalizer(dayjs)
// const dashboard = () => {
//   const date =new Date(); 
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [appointments, setAppointments] = useState({

//     '2025-01-15': { time: '2:00 PM', description: 'Doctor Appointment' },
//     '2025-01-20': { time: '11:00 AM', description: 'Meeting' },
//   });

  
//   const myEventsList = [
//     {
//       title: 'Doctor Appointment',
//       start: new Date(2025, 0, 15, 14, 0),
//       end: new Date(2025, 0, 15, 15, 0),
//     },
//     {
//       title: 'Meeting',
//       start: new Date(2025, 0, 20, 11, 0),
//       end: new Date(2025, 0, 20, 12, 0),
//     },
//     ]

//   return (
//     <div className='w-full'>
//       <div className='w-full px-4 py-8 overflow-hidden'>
//               <div className="w-full grid grid-cols-1 gap-x-8 md:grid-cols-2 lg:grid-cols-3 md:gap-8 mt-4">

//         <Cards title={"Call a Doctor" } img={call} />
//         <Cards title={"Schedule an Appointment with a Specialist" } img={calendarIcon} />
//         <Cards title={"Get your test done" } img={testTube} />
//               </div>

//           <div className="w-full mt-6 py-4 bg-gray-100 flex flex-col gap-y-6 lg:gap-y-0 lg:flex-row items-start gap-x-8 px-1">
//             <div className='w-full lg:w-[76%] rounded-lg border bg-white border-gray-200 p-4'> 

//     <Calendar
//       localizer={localizer}
//       events={myEventsList}
//       startAccessor="start"
//       endAccessor="end"
//       style={{ height: 400, color: 'gray', fontSize: 18, textAlign: 'center' }}
//     />
//             </div>
//             <div className='w-full lg:w-[24%] h-[400px] rounded-lg border overflow-y-auto bg-white border-gray-200 p-4'>
//               <h2 className='text-lg font-bold text-blue-900 md:text-xl'>Appointments</h2>
//               <p className='text-gray-950/60 text-sm'>View your upcoming appointments</p>
//             </div>
//   </div>
//       </div>
//     </div>
//   )
// }

// export default dashboard
import React, { useState } from 'react';
import Cards from '../components/reuseables/Cards';
import call from './assets/call (2).svg';
import calendarIcon from "../assets/calendarIcon.jpeg";
import testTube from "../assets/test.jpeg";
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Modal, Box, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { baseUrl } from '../env';
import axios from 'axios';
import { Link } from 'react-router-dom';

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


 const specialistCategories = [
    { id: 1, name: 'Psychiatrist', count: 7, icon: '🧠' },
    { id: 2, name: 'Clinical Psychologist', count: 4, icon: '🎯' },
    { id: 3, name: 'Therapist', count: 5, icon: '💭' },
    { id: 4, name: 'Sex Therapist', count: 3, icon: '❤️' },
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
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [isSpecialistsModalOpen, setIsSpecialistsModalOpen] = useState(false);
  const [isCallADoctorModalOpen, setIsCallADoctorModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [videoLink, setVideoLink] = useState(null);
  const [appointments, setAppointments] = useState({
    '2025-01-15': { time: '2:00 PM', description: 'Doctor Appointment',doctors: 'Dr. Sarah Smith' },
    '2025-01-20': { time: '11:00 AM', description: 'Meeting', doctors: 'Dr. James Johnson' },
  });

  const patientId = JSON.parse(localStorage.getItem('userData')).id;
  const CREATE_MEETING = `${baseUrl}/api/v1/video/create-meeting?patientId=${patientId}`;

  console.log(patientId)
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

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setIsSpecialistsModalOpen(true);
  };

  const createMeeting = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      
      if (!patientId) {
        throw new Error('Patient ID not found');
      }
      
      const response = await axios.post(CREATE_MEETING);
      
  
      setVideoLink(response.data);
      
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create meeting');
      console.error('Error creating meeting:', err);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleSpecialistClick = (specialist) => {
    const newAppointment = {
      title: `Appointment with ${specialist.name}`,
      start: new Date(),  
      end: new Date(new Date().setHours(new Date().getHours() + 1)),
    };
    
    setAppointments(prev => ({
      ...prev,
      [dayjs(newAppointment.start).format('YYYY-MM-DD')]: {
        time: dayjs(newAppointment.start).format('h:mm A'),
        description: `Appointment with ${specialist.name}`,
      },
    }));
    
    setIsSpecialistsModalOpen(false);
    setIsMainModalOpen(false);
  };

  return (
    <div className='w-full'>
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
            {Object.entries(appointments).map(([date, details]) => (
              <div key={date} className="mt-4 p-3 border rounded-lg">
                <p className="font-medium">{date}</p>
                <p className="text-sm text-gray-600">{details.time}</p>
                <p className="text-sm">{details.description}</p>
                <p className="text-sm">{details.doctors}</p>
              </div>
            ))}
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
         
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {selectedCategory && specialists[selectedCategory].map((specialist) => (
              <ListItem key={specialist.id} disablePadding>
                <ListItemButton >
                <div className='flex items-center justify-between w-full'>
                  <div className="w-[60%]">

                  <ListItemText 
                 
                    primary={specialist.name}
                    secondary={specialist.specialty}
                  />
                  </div>
                  <div className='w-[40%] flex items-center gap-x-2'>

                  <ListItemText primary={specialist.time.map((t)=> {return t + " | "})} sx={{color: "grey"}}/>
                  <button className='text-blue-800 text-sm'>Book</button>
                  </div>
                  </div>
                </ListItemButton>
              </ListItem>
            ))}
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
            <p className='text-xl text-center font-medium'>Click to create a meeting</p>
          <button className="bg-blue-500 w-full h-14 text-white rounded-full" onClick={createMeeting}>
            Create a meeting
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
    </div>
  );
};

export default Dashboard;