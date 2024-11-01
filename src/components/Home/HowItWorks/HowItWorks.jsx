
import React from 'react';
import verify from "../assets/bitcoin-icons_verify-filled.png";
import broken from "../assets/broken.png";
import frame from "../assets/Frame 175.png";

const HowItWorks = () => {
  
  return (
    <div className="bg-[#FFFFFF] px-10 py-16 text-[#020E7C]">
     
      <div className="flex justify-center">
       <h1 className='text-2xl'>Get Started with Your Account</h1>
      </div>

     
      <div className="sm:flex justify-between items-center gap-20 mt-20">
      
        <div className="w-full lg:w-1/2">
         
          <div className="flex justify-start items-center gap-7 mt-10">
            <img src={verify} alt="Verify Account" className="w-7 h-7" />
            <div>
              <h1 className="font-bold text-[18px]">Account Creation</h1>
              <p className="mt-2 text-[17px] text-gray-700 max-w-lg">
              Create your account to get started. <br/>
              Fill in your details to register <br/>
              and unlock access to our services.
              </p>
            </div>
          </div>
           
          <div className="flex justify-start items-center gap-7 mt-10">
            <img src={verify} alt="Verify Account" className="w-7 h-7" />
            <div>
              <h1 className="font-bold text-[18px]">Verify Your Account</h1>
              <p className="mt-2 text-[17px] text-gray-700 max-w-lg">
               Check your email for the OTP verification code.<br/>
               Enter the code to verify your account<br/>
                and secure your information
              </p>
            </div>
          </div>
          <div className="flex justify-start items-center gap-7 mt-10">
            <img src={broken} alt="Enjoy Services" className="w-7 h-7" />
            <div>
              <h1 className="font-bold text-[18px]">Login and Start Enjoying the Services</h1>
              <p className="mt-2 text-[17px] text-gray-700 max-w-md">
                Once verified, log in to access our services, <br/>
                 including booking appointments, <br/>
                video/voice calls, and more.
              </p>
            </div>
          </div>

          <button className="flex items-center justify-center mt-8 bg-[#020E7C] rounded-md text-white py-4 px-6 w-full lg:w-3/4 font-bold text-lg">
            
            <a href='/doctor_signup' target="" className='text-blue-500'>
                 <p>Get Started</p>
            </a>
          </button>
        </div>
        <div className="mt-10 lg:mt-0 lg:w-1/2 flex justify-center">
          <img src={frame} alt="Frame" className="w-full max-w-lg object-cover" />
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
