import React from 'react'
import ProfileP from '../../assets/ProfileP.png'
import messages from "../../assets/mail-add-02.png"
import missedCall from "../../assets/call-missed-02.png"

const DoctorProfile = () => {
  return (
    <div className='bg-white rounded-3xl shadow-lg p-6 max-w-md mx-auto mt-14'>
      <div className='flex flex-col items-center mb-6'>
        <img
          src={ProfileP}
          alt='Dr. Buchi David'
          className='w-32 h-32 rounded-2xl mb-4'
        />
        <h2 className='text-xl font-bold text-blue-900'>Dr. Buchi David</h2>
        <p className='text-sm text-gray-600'>
          Darmatologist, Nigerian Hospital.
        </p>
      </div>

      <hr className='my-8' />

      <div className='mb-6'>
        <h3 className='text-sm font-semibold text-blue-900 mb-2'>Status</h3>
        <p className='text-xs text-gray-600 mb-1'>Progress</p>
        <div className='w-full bg-gray-200 rounded-full h-2'>
          <div className='bg-blue-900 h-2 rounded-full w-3/4'></div>
        </div>
      </div>

      <hr className='my-8' />

      <div className='grid grid-cols-2 gap-4 mb-6'>
        {[
          { label: 'Appointment', value: '10' },
          { label: 'Total Patient', value: '50' },
          { label: 'Consultations', value: '20' },
          { label: 'Return Patient', value: '5' }
        ].map((item, index) => (
          <div key={index} className='text-center'>
            <p className='text-2xl font-bold text-blue-900'>{item.value}</p>
            <p className='text-xs text-gray-600'>{item.label}</p>
          </div>
        ))}
      </div>

      <div className='flex justify-between'>
      <button className='bg-blue-900 text-white whitespace-nowrap rounded-lg py-3 px-4 flex flex-col items-center justify-center w-[48%]'>
    <span className='text-2xl font-bold mb-1'>9</span>
    <span className='text-sm mb-2'>Missed calls</span>
    <img src={missedCall} alt='missed calls' className='w-6 h-6' />
  </button>
       
  <button className='border border-blue-900 whitespace-nowrap text-blue-900 rounded-lg py-3 px-4 flex flex-col items-center justify-center w-[48%]'>
    <span className='text-2xl font-bold mb-1'>10</span>
    <span className='text-sm mb-2'>Messages</span>
    <img src={messages} alt='messages' className='w-6 h-6' />
  </button>
      </div>
    </div>
  )
}

export default DoctorProfile
