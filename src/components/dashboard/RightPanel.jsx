import DoctorInfo from './DoctorInfo'
import Stats from './Stats'
import Income from './Income'


function RightPanel () {
  return (
    <div className=' hidden lg:block  w-full lg:w-1/2 p-4 space-y-6   '>
      <DoctorInfo />
      {/* <Stats /> */}
      <Income />
    </div>
  )
}
export default RightPanel
