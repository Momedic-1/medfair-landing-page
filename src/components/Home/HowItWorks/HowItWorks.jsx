import React from 'react'
import download from "../assets/ic_baseline-download.png"
import verify from "../assets/bitcoin-icons_verify-filled.png";
import broken from "../assets/broken.png";
import frame from "../assets/Frame 175.png";
const HowItWorks = () => {
  return (
    <div className="bg-[#FFFFFF] p-16 text-[#020E7C] ">
            <div>
              <h1 className="font-normal text-[12px] flex-nowrap text-center lg:text-start lg:mb-4">HOW IT WORKS</h1>
              <div className="sm:block hidden">
                <h1 className="font-bold text-[27px] w-[100%] max-w-[35rem]">
                  A medical app that brings the Doctors closer to you.
                </h1>
                <p className="font-normal text-[18px] mt-2">
                  Easy 3 steps to use our services
                </p>
              </div>
            </div>
  
            <div className="sm:flex justify-center item-center gap-20 mt-20">
              <div className=" ">
                <div className="flex justify-center lg:-ml-16 md:ml-12 items-center gap-7 mt-10 sm:ml-[-8px] mr-[8.25rem] w-full">
                 <img src={download} alt=''/>
                 
                  <div>
                    <h1 className="font-bold text-[15px] ">
                      Download App & Sign Up
                    </h1>
                    <p className="mt-5 w-[100%] max-w-[20rem] ">
                      First download our app on apple store or google store and
                      register
                    </p>
                  </div>
                </div>
                <div className="flex justify-center items-center gap-7 mt-10 w-full md:px-9  lg:px-14">
                <img src={verify} alt=''/>
                  <div>
                    <h1 className="font-bold text-[15px]">Verify Your Account</h1>
                    <p className="mt-5 w-full sm:w-[52%]">
                      Check your mail for OTP verification code to verify your
                      details to secure your account
               </p>
                  </div>
                </div>
                <div className="flex justify-center items-center  gap-7 mt-10 w-full sm:ml-[15px] lg:px-10">
                <img src={broken} alt=''/>
                 
                  <div>
                    <h1 className="font-bold text-[15px]">
                      Start Enjoying the Services
                    </h1>
                    <p className="mt-5 w-[100%] sm:w-[52%]">
                      Enjoy our our services like input card details, book
                      appointments, video/voice call and more
                    </p>
                  </div>
                </div>
                <button className="flex items-center  justify-center mt-7 bg-[#020E7C] rounded-md text-white p-3 sm:w-[60%] sm:p-4 sm:py-4 md:w-[42%] md:py-3 md:text-center lg:w-[42%] sm:ml-[7rem] w-[60%] ml-[4rem] font-bold sm:text-[20px] text-[15px]">
                  Get Started
                </button>
              </div>
              
              <div className="mt-5">
                <img src={frame} alt="frame" />
              </div>
            </div>
          
          </div>
  )
}

export default HowItWorks