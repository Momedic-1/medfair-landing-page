import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";

const VerificationSuccessful = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000); 
   
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className='flex items-center justify-center bg-white mt-24'>
      <div className='bg-gray-50 p-20 rounded-lg shadow-lg text-center max-w-md w-full'>
        <svg
          width='167'
          height='167'
          className='h-20 w-20 mx-auto mb-4 text-blue-600'
          viewBox='0 0 167 167'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <circle cx='83.2834' cy='83.0256' r='83.009' fill='#136CFB' />
          <g filter='url(#filter0_d_1_4119)'>
            <path
              d='M54.4844 88.9547L74.8989 106.742L112.082 59.3086'
              stroke='white'
              strokeWidth='5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </g>
          <defs>
            <filter
              id='filter0_d_1_4119'
              x='48.9844'
              y='56.8086'
              width='68.5981'
              height='59.4336'
              filterUnits='userSpaceOnUse'
              colorInterpolationFilters='sRGB'
            >
              <feFlood floodOpacity='0' result='BackgroundImageFix' />
              <feColorMatrix
                in='SourceAlpha'
                type='matrix'
                values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0'
                result='hardAlpha'
              />
              <feOffset dy='4' />
              <feGaussianBlur stdDeviation='1.5' />
              <feColorMatrix
                type='matrix'
                values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0'
              />
              <feBlend
                mode='normal'
                in2='BackgroundImageFix'
                result='effect1_dropShadow_1_4119'
              />
              <feBlend
                mode='normal'
                in='SourceGraphic'
                in2='effect1_dropShadow_1_4119'
                result='shape'
              />
            </filter>
          </defs>
        </svg>

        <h1 className='text-2xl font-bold text-gray-800 mb-0 md:mb-2'>
          Verification Successful!
        </h1>
      </div>
    </div>
  );
}

export default VerificationSuccessful;
