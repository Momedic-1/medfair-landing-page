import React from 'react'
import avalableCall from "../assets/avalable.png";
import permission from "../assets/chap.png"
import plus from    "../assets/cross.png"
import warning from "../assets/warning.png"

const Offer = () => {
  return (
      <div className="bg-[#020E7c] mt-5 sm:p-16 p-[1rem] text-white  w-full ">
           <div className="w-[100%] sm:px-24 px-6 text-left sm:text-left">
    <h1 className="font-normal text-[15px] font-roboto">
      WHY CHOOSE US?
    </h1>
    <h1 className="mt-2 font-bold text-[23px] md:w-[40%] leading-tight">
      Access your medical care <br />
      and services all in one app
    </h1>
    <p className="mt-5 leading-tight max-w-[34rem] md:max-w-[33rem] sm:max-w-32">
      We standout for your convenience, trust, cost, and enhanced confidentiality.
      Customers can access medical care from anywhere
      using their mobile devices.
    </p>
  </div>
  
            <div className="sm:flex mt-7 grid grid-cols-2 gap-5 ">
              <div className="flex flex-col items-center">
                <span className="bg-white border border-gray-300 rounded-full flex items-center justify-center w-10 h-10">
                 <img src={avalableCall} alt='avalable'/>
                 
                </span>
                <h1 className="mt-2 font-bold text-[15px] text-center">
                  24/7 Book Appoint
                </h1>
                <p className="w-[85%] sm:w-[50%] ml-[30px] mt-3 font-normal text-[11px] ">
                  Call on the go with 24/7 Doctors on standby when you use the
                  MEDFAIR app.
                </p>
              </div>
  
              <div className="flex flex-col items-center">
              <span className="bg-white border border-gray-300 rounded-full flex items-center justify-center w-10 h-10">
                <img src={plus} alt='plus'/>
                  
                </span>
                <h1 className="mt-2 font-bold text-[15px] text-center">
                  24/7 Book Appoint
                </h1>
                <p className="w-[85%] sm:w-[50%] ml-[30px] mt-3 font-normal text-[11px] ">
                  Call on thee go with 24/7 Doctors on standby when you use the
                  MEDFAIR app.
                </p>
              </div>
              <div className="flex flex-col items-center">
              <span className="bg-white border border-gray-300 rounded-full flex items-center justify-center w-10 h-10">
                <img src={permission} alt='permission'/>
              
                </span>
                <h1 className="mt-2 font-bold text-[15px] text-center">
                  Topnotch Privacy
                </h1>
                <p className="w-[85%] sm:w-[50%] ml-[30px] mt-3 font-normal text-[11px] ">
                  Call on thee go with 24/7 Doctors on standby when you use the
                  MEDFAIR app.
                </p>
              </div>
              <div className="flex flex-col items-center">
              <span className="bg-white border border-gray-300 rounded-full flex items-center justify-center w-10 h-10">
                <img src={warning} alt='avalable'/>
                 
                </span>
                <h1 className="mt-2 font-bold text-[15px] text-center">
                  24/7 Client Attention
                </h1>
                <p className="w-[85%] sm:w-[50%] ml-[30px] mt-3 font-normal text-[11px] ">
                  Call on thee go with 24/7 Doctors on standby when you use the
                  MEDFAIR app.
                </p>
              </div>
            </div>
          </div>
  )
}

export default Offer