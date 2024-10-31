import React from 'react';
import group from "../assets/Group 7688.png"
import { FiArrowUpRight } from "react-icons/fi";
const Benefit = () => {
  return (
    <div className="bg-[#FFFFFF]">
    <div className="sm:flex gap-20 justify-center p-16">
      <div>
        <h2 className="font-normal text-[15px] text-[#020E7C]">
          Who Benefits from Medfair?
        </h2>
        <h1 className="font-bold sm:text-[34px] text-[20px] text-[#020E7C] leading-9">
          Who Benefits from Medfair?
        </h1>
        <p className=" sm:block hidden font-normal text-[12px] text-[#020E7C] w-[312px]  mt-4">
          At Medfair, we carter to a diverse range of stakeholders each
          playing a vital role in our mission to resuccitate healthcare
          accessibilty. From Individuals seeking quality medical care to
          corperate partners, making well-being of employees paramount.
          Find out how Medfair meets your medical needs.{" "}
        </p>

        <div>
          <img src={group} alt="group"  className='lg:w-[70%] md:[60%] w-[80%] mt-3' />
        </div>
      </div>
      <div className="mt-16 -ml-6">
        <div className=" sm:w-[636px] sm:h-[138px]  w-[305px] h-[171px] border border-[#A3ADFF] rounded-xl p-4 text-[#020E7C]">
          <h1 className="font-bold text-[20px] leading-9">Patients</h1>
          <p className="sm:w-[552px] h-[98px] w-[286px] font-normal text-[12px] sm:w[700px] sm:h-[61px]">
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
        <div className=" sm:w-[636px] sm:h-[138px] w-[305px] h-[171px] border border-[#A3ADFF] rounded-xl p-4 text-[#020E7C] mt-4">
          <h1 className="font-bold text-[20px] leading-9">Doctors</h1>
          <p className="sm:w-[552px] h-[98px] w-[286px] font-normal text-[12px] sm:w[700px] sm:h-[61px]">
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
        <div className=" sm:w-[636px] sm:h-[138px] w-[305px] h-[171px] border border-[#A3ADFF] rounded-xl p-4 text-[#020E7C] mt-4">
          <h1 className="font-bold text-[20px] leading-9">Partners</h1>
          <p className="sm:w-[552px] h-[98px] w-[286px] font-normal text-[12px] sm:w[700px] sm:h-[61px]">
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
        <div className=" sm:w-[636px] sm:h-[138px] w-[305px] h-[171px] border border-[#A3ADFF] rounded-xl p-4 text-[#020E7C] mt-4">
          <h1 className="font-bold text-[20px] leading-9">
            Corporate Organization
          </h1>
          <p className="sm:w-[552px] h-[98px] w-[286px] font-normal text-[12px] sm:w[700px] sm:h-[61px]">
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
        <div className=" sm:w-[636px] sm:h-[138px] w-[305px] h-[171px] border border-[#A3ADFF] rounded-xl p-4 text-[#020E7C] mt-4">
          <h1 className="font-bold text-[20px] leading-9">Volunteer</h1>
          <p className="sm:w-[552px] h-[98px] w-[286px] font-normal text-[12px] sm:w[700px] sm:h-[61px]">
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