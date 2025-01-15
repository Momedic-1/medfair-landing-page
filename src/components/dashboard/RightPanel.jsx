import DoctorInfo from './DoctorInfo'
import Income from './Income'


function RightPanel () {
  return (
    <div className='w-full lg:w-1/2 p-4 space-y-6   '>
      <DoctorInfo />
      {/* <Stats /> */}
      <Income />
    </div>
  )
}
export default RightPanel
