import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'

function HomePage () {
  return (
    <div className='flex flex-col lg:flex-row min-h-screen items-center justify-center bg-gray-100'>
      <LeftPanel />
      <RightPanel /> 
    </div>
  )
}

export default HomePage
