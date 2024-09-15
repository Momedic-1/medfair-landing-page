import DoctorInfo from './DoctorInfo'
import Stats from './Stats'
import Income from './Income'

function RightPanel () {
  return (
    <div className='w-full lg:w-1/3 p-4 space-y-6 hidden lg:block'>
      <DoctorInfo />
      {/* <Stats /> */}
      <Income />
    </div>
  )
}

export default RightPanel
