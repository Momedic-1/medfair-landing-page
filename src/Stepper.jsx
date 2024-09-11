import React from 'react'

const Stepper = ({ currentStep }) => {
  return (
    <div className='flex items-center justify-between mb-6'>
      <div className='flex items-center'>
        <div
          className={`w-15 h-15 rounded-full flex items-center justify-center ${
            currentStep >= 1
              ? 'bg-blue-600 text-white'
              : 'bg-gray-300 text-white'
          }`}
        >
          1
        </div>
        <div
          className={`ml-2 ${
            currentStep >= 1 ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          Account
        </div>
      </div>
      <div className='flex items-center'>
        <div
          className={`w-15 h-15 rounded-full flex items-center justify-center ${
            currentStep >= 2
              ? 'bg-blue-600 text-white'
              : 'bg-gray-300 text-white'
          }`}
        >
          2
        </div>
        <div
          className={`ml-2 ${
            currentStep >= 2 ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          Verification
        </div>
      </div>
      <div className='flex items-center'>
        <div
          className={`w-15 h-15 rounded-full flex items-center justify-center ${
            currentStep >= 3
              ? 'bg-blue-600 text-white'
              : 'bg-gray-300 text-white'
          }`}
        >
          3
        </div>
        <div
          className={`ml-2 ${
            currentStep >= 3 ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          Log In
        </div>
      </div>
    </div>
  )
}

export default Stepper
