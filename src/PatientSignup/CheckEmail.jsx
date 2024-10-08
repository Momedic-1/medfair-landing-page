import React, { useEffect } from 'react'
import CheckEmailImage from "../assets/CheckEmailImage.jsx";

const CheckEmail = ({ onAnimationComplete, email }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete()
      }
    }, 3000) // Show for 3 seconds

    return () => clearTimeout(timer)
  }, [onAnimationComplete])

  return (
    <div className='flex items-center justify-center min-h-screen bg-white animate-fade-in'>
      <div className='bg-gray-50 p-8 rounded-lg shadow-lg text-center max-w-md w-full'>
        <CheckEmailImage/>

        <h1 className='text-2xl font-bold text-gray-800 mb-2'>
          Check your email!
        </h1>
        <p className='text-gray-500'>
          A verification code was sent to you
          <br />
          <p>({email ? email: 'solomonmoregood97@gmail.com'}).</p>
        </p>
      </div>
    </div>
  )
}

export default CheckEmail
