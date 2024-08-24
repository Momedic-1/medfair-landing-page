import WelcomeBack from './WelcomeBack'
import AppointmentRequests from './AppointmentRequests'
import Appointments from './Appointments'
import RecentPatients from './RecentPatients'

function LeftPanel () {
  return (
    <div className='w-full lg:w-2/3 p-4 space-y-6'>
      <WelcomeBack />
      <div className='flex flex-col lg:flex-row'>
        <AppointmentRequests />
        <Appointments />
      </div>
      <RecentPatients />
    </div>
  )
}

export default LeftPanel
