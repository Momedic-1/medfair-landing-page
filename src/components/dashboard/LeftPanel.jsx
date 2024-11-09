
import WelcomeBack from './WelcomeBack/WelcomeBack'
import Appointments from './Appointments'
import RecentPatients from './RecentPatients'


function LeftPanel({status}) {
  return (
    <div className='w-full lg:w-2/3  p-4 space-y-4 mb-20 '>
      <WelcomeBack status={status} />
      <div className='flex flex-col lg:flex-row justify-center items-center'>
        <Appointments />
      </div>
      <div className='hidden lg:block'>
        <RecentPatients />
      </div>
    </div>
  )
}

export default LeftPanel
