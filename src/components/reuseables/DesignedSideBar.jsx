import React from 'react'
import person from '../../../src/assets/person.svg';
import medfair from '../../../src/assets/medfair (2).svg';
function DesignedSideBar() {
  return (
    <div className="w-full lg:w-1/3 bg-gradient-to-r from-blue-500 to-indigo-600 lg:flex items-center justify-center  ">
        <div className="text-white flex lg:block text-center items-center justify-center mr-20 lg:mr-0 p-6">
        <img src={person} className="lg:h-60 md:h-40 h-28 w-60 " alt="Person" />
        <div className="flex flex-col justify-center items-center">
            <img src={medfair} alt="Design Icon" className="md:h-20 h-16 w-20" />
            <p className="text-center text-xl">MEDFAIR</p>
        </div>
        </div>
  </div>
  )
}

export default DesignedSideBar