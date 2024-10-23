import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'

function HomePage () {
  return (
    <div className='flex flex-col px-2 lg:flex-row min-h-screen items-stretch lg:items-start justify-center bg-gray-100 p-5'>
      <LeftPanel />
      <RightPanel /> 
    </div>
  )
  
}

export default HomePage
