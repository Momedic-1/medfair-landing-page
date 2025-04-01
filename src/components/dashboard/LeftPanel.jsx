
import WelcomeBack from './WelcomeBack/WelcomeBack'
import Appointments from './Appointments'
import { useEffect, useState } from 'react';
import AppointmentRequests from './AppointmentRequests';
import axios from 'axios';
import { baseUrl } from '../../env';



function LeftPanel({status}) {
  const [appointments, setAppointments] = useState([]);
  const doctorId = JSON.parse(localStorage.getItem('userData')).id;
  const token = JSON.parse(localStorage.getItem('authToken')).token;

  const getDoctorsAppointmentRequest = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/appointments/upcoming/doctor/${doctorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
   
      setAppointments(response?.data);
    }
    catch (error) {
      console.error(error);
    }
  };

  useEffect(()=> {
    getDoctorsAppointmentRequest()
  }, [])
  return (
    <div className='w-full py-4'>
      <WelcomeBack status={status} />
      <div className='w-full flex flex-col-reverse gap-y-6 lg:flex-row lg:justify-between lg:items-start justify-center px-2 lg:px-0 items-center mt-4 gap-x-4 lg:gap-x-8'>
        <div className="flex justify-between items-start w-full lg:w-[40%]">

      <AppointmentRequests appointments={appointments}/>
      </div>
      <div className='w-full lg:w-[60%] lg:mt-0'>

        <Appointments />
      </div>
      </div>

    </div>
  )
}

export default LeftPanel
