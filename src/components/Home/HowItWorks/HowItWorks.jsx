
import React from 'react';
import verify from "../assets/bitcoin-icons_verify-filled.png";
import broken from "../assets/broken.png";
import frame from "../assets/Frame 175.png";
import Stepper from '../../../Steps';

const HowItWorks = () => {
  const stepLabels = ['Account', 'Verification', 'Login'];
  const currentStep = 1;

  return (
    <div className="bg-[#FFFFFF] px-10 py-16 text-[#020E7C]">
     
      <div className="flex justify-center">
        <div className="w-[104%] lg:w-3/4 xl:w-2/1">
          <Stepper stepLabels={stepLabels} currentStep={currentStep} />
        </div>
      </div>

     
      <div className="sm:flex justify-between items-center gap-20 mt-20">
      
        <div className="w-full lg:w-1/2">
         
          <div className="flex justify-start items-center gap-7 mt-10">
            <img src={verify} alt="Verify Account" className="w-7 h-7" />
            <div>
              <h1 className="font-bold text-[18px]">Verify Your Account</h1>
              <p className="mt-2 text-sm text-gray-700 max-w-md">
                Check your mail for OTP verification code to verify your details
                and secure your account.
              </p>
            </div>
          </div>

          <div className="flex justify-start items-center gap-7 mt-10">
            <img src={broken} alt="Enjoy Services" className="w-7 h-7" />
            <div>
              <h1 className="font-bold text-[18px]">Start Enjoying the Services</h1>
              <p className="mt-2 text-sm text-gray-700 max-w-md">
                Enjoy our services like inputting card details, booking appointments,
                video/voice calls, and more.
              </p>
            </div>
          </div>

          <button className="flex items-center justify-center mt-8 bg-[#020E7C] rounded-md text-white py-4 px-6 w-full lg:w-3/4 font-bold text-lg">
            Get Started
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
