
import WelcomeBack from './WelcomeBack/WelcomeBack'
import Appointments from './Appointments'
import { useState } from 'react';
import AppointmentRequests from './AppointmentRequests';



function LeftPanel({status}) {
  const [appointments, setAppointments] = useState([]);
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
