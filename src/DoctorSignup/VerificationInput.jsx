import React, { useState } from 'react'

const VerificationInput = () => {
  const [code, setCode] = useState(['', '', '', '', ''])

  const handleChange = (index, value) => {
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 4) {
      document.getElementById(`input-${index + 1}`).focus()
    }
  }

  return (
    <div className='bg-white p-6 rounded-lg'>
      <h2 className='text-xl font-bold text-center mb-4'> Check your email!</h2>
      <p className='text-sm text-center text-gray-400 font-medium mb-4'>
        A verification code was sent to you (solomonmoregood97@gmail.com).
      </p>
      <p className='text-sm text-center mb-4 font-medium text-gray-400'>
        Enter the 5-digit code to verify your Medfair account
      </p>
      <p className='text-sm text-center text-blue-500 mb-4'>Open email app</p>
      <div className='flex justify-center space-x-2 mb-16'>
        {code.map((digit, index) => (
          <input
            key={index}
            id={`input-${index}`}
            type='text'
            maxLength='1'
            className='w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={digit}
            onChange={e => handleChange(index, e.target.value)}
          />
        ))}
      </div>
      <div className='flex justify-center'>
        <button className='w-full max-w-xs bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition duration-300'>
          Verify
        </button>
      </div>
    </div>
  )
}

export default VerificationInput
