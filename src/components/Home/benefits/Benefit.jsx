import React from 'react';
import { useNavigate } from 'react-router-dom';
import group from "../assets/Group 7688.png"
import { FiArrowUpRight } from "react-icons/fi";
const Benefit = () => {
 
  const navigate = useNavigate();
  return (
    <div className="bg-[#FFFFFF]">
    <div className="sm:flex gap-20 justify-center p-16 md:flex-col lg:flex-row  overflow-x: auto ">
      <div className='px-10'>
        <p className='text-[#020E7C]'>Who Benefits from Medfair?</p>
        <h1 className="font-bold sm:text-[34px] text-[20px] text-[#020E7C] leading-9 md:text-center lg:mb-5">
          Who Benefits from Medfair?
        </h1>
        <p className=" sm:block hidden md:block md:pl-20  font-normal text-[12px] text-[#020E7C] w-[312px]  mt-4">
          At Medfair, we carter to a diverse range of stakeholders each
          playing a vital role in our mission to resuccitate healthcare
          accessibilty. From Individuals seeking quality medical care to
          corperate partners, making well-being of employees paramount.
          Find out how Medfair meets your medical needs.{" "}
        </p>

        <div>
          <img src={group} alt="group"  className='lg:w-[200%] md:w-[60%] md:pl-20 w-[80%] mt-3' />
        </div>
      </div>
      <div className="mt-16 -ml-6 md:px-20 ">
        <div className=" sm:w-[636px] sm:h-[138px] lg:w-[540px] md:w-[430px]  w-[305px] h-[171px] border border-[#A3ADFF] rounded-xl p-4 text-[#020E7C] cursor-pointer"   onClick={() => navigate("/doctor_signup")}>
          <h1 className="font-bold text-[20px] leading-9">Patients</h1>
          <p className="sm:w-[552px] h-[98px] w-[286px] md:max-w-96 font-normal text-[12px] sm:w[700px] sm:h-[61px]">
            At Medfair, we carter to a diverse range of stakeholders each
            playing a vital role in our mission to resuccitate healthcare
            accessibilty. From Individuals seeking quality medical care to
          </p>
          <h2 className="w-[299px] h-[14px] font-semibold text-[12px] flex ">
            Be a part of our healthcare professionals.{" "}
            <span>
              <FiArrowUpRight />
            </span>
          </h2>
        </div>
        <div className=" sm:w-[636px] sm:h-[138px] lg:w-[540px] w-[305px] md:w-[430px] h-[171px] border border-[#A3ADFF] rounded-xl p-4 text-[#020E7C] mt-4 cursor-pointer" onClick={() => navigate("/doctor_signup")}>
          <h1 className="font-bold text-[20px] leading-9">Doctors</h1>
          <p className="sm:w-[552px] h-[98px] w-[286px] md:max-w-96  font-normal text-[12px] sm:w[700px] sm:h-[61px]">
            At Medfair, we carter to a diverse range of stakeholders each
            playing a vital role in our mission to resuccitate healthcare
            accessibilty. From Individuals seeking quality medical care to
          </p>
          <h2 className="w-[299px] h-[14px] font-semibold text-[12px] flex ">
            Be a part of our healthcare professionals.{" "}
            <span>
              <FiArrowUpRight />
            </span>
          </h2>
        </div>
        <div className=" sm:w-[636px] sm:h-[138px] lg:w-[540px] w-[305px] md:w-[430px] h-[171px] border border-[#A3ADFF] rounded-xl p-4 text-[#020E7C] mt-4 cursor-pointer" onClick={() => navigate("/doctor_signup")}>
          <h1 className="font-bold text-[20px] leading-9">Partners</h1>
          <p className="sm:w-[552px] h-[98px] w-[286px] md:max-w-96  font-normal text-[12px] sm:w[700px] sm:h-[61px]">
            At Medfair, we carter to a diverse range of stakeholders each
            playing a vital role in our mission to resuccitate healthcare
            accessibilty. From Individuals seeking quality medical care to
          </p>
          <h2 className="w-[299px] h-[14px] font-semibold text-[12px] flex">
            Be a part of our healthcare professionals.{" "}
            <span>
              <FiArrowUpRight />
            </span>
          </h2>
        </div>
        <div className=" sm:w-[636px] sm:h-[138px] lg:w-[540px] md:w-[430px]  w-[305px] h-[171px] border border-[#A3ADFF] rounded-xl p-4 text-[#020E7C] mt-4 cursor-pointer" onClick={() => navigate("/doctor_signup")}>
          <h1 className="font-bold text-[20px] leading-9">
            Corporate Organization
          </h1>
          <p className="sm:w-[552px]  h-[98px] md:max-w-96  w-[286px] font-normal text-[12px] sm:w[700px] sm:h-[61px]">
            At Medfair, we carter to a diverse range of stakeholders each
            playing a vital role in our mission to resuccitate healthcare
            accessibilty. From Individuals seeking quality medical care to
          </p>
          <h2 className="w-[299px] h-[14px] font-semibold text-[12px] flex">
            Be a part of our healthcare professionals.{" "}
            <span>
              <FiArrowUpRight />
            </span>
          </h2>
        </div>
        <div className=" sm:w-[636px] sm:h-[138px] md:w-[430px] lg:w-[540px] w-[305px] h-[171px] border border-[#A3ADFF] rounded-xl p-4 text-[#020E7C] mt-4 cursor-pointer" onClick={() => navigate("/doctor_signup")}>
          <h1 className="font-bold text-[20px] leading-9">Volunteer</h1>
          <p className="sm:w-[552px] h-[98px] md:max-w-96  w-[286px] font-normal text-[12px] sm:w[700px] sm:h-[61px]">
            At Medfair, we carter to a diverse range of stakeholders each
            playing a vital role in our mission to resuccitate healthcare
            accessibilty. From Individuals seeking quality medical care to
          </p>
          <h2 className="w-[299px] h-[14px] font-semibold text-[12px] flex">
            Be a part of our healthcare professionals.{" "}
            <span>
              <FiArrowUpRight />
            </span>
          </h2>
        </div>
      </div>
    </div>
  </div>
  )
}

export default Benefit