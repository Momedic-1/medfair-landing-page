
import WelcomeBack from './WelcomeBack/WelcomeBack'
import AppointmentRequests from './AppointmentRequests'
import Appointments from './Appointments'
import RecentPatients from './RecentPatients'


function LeftPanel() {
  return (
    <div className='w-full lg:w-2/3  p-4 space-y-4 mb-20   '>
      <WelcomeBack />
      <div className='flex flex-col lg:flex-row justify-center items-center'>
        <div className='hidden lg:block mb-20 lg:mb-0'>
          <AppointmentRequests />
        </div>
        <Appointments />
      </div>
      <div className='hidden lg:block'>
        <RecentPatients />
      </div>
    </div>
  )
}

export default LeftPanel
