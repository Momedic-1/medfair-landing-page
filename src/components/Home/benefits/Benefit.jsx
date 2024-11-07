import React from 'react';
import { useNavigate } from 'react-router-dom';
import group from "../assets/Group 7688.png"
import { FiArrowUpRight } from "react-icons/fi";
const Benefit = () => {
 
  const navigate = useNavigate();
  return (
    <div className="bg-[#FFFFFF]">
    <div className="sm:flex gap-20  p-16 md:flex-col lg:flex-row  overflow-x: auto ">
      <div className=''>
        <h2 className='text-[#020E7C]'>Who Benefits from Medfair?</h2>
        <h1 className="font-bold sm:text-[34px] text-[20px] text-[#020E7C] leading-9  lg:mb-1 lg:mr-16">
          Who Benefits from Medfair?
        </h1>
        <p className=" sm:block hidden md:block  lg:pl-1  font-normal text-[13px] text-[#020E7C] w-[312px]  mt-4">
          At Medfair, we carter to a diverse range of stakeholders each
          playing a vital role in our mission to resuccitate healthcare
          accessibilty. From Individuals seeking quality medical care to
          corperate partners, making well-being of employees paramount.
          Find out how Medfair meets your medical needs.{" "}
        </p>

        <div className='mt-3'>
          <img src={group} alt="group"  width={420}  />
        </div>
      </div>
      <div className="mt-16 -ml-6 md:px-20 ">
        <div className=" sm:w-[636px] sm:h-[168px] lg:w-[540px] lg:h-[180px] md:w-[430px] md:h-[200px]  w-[305px] h-[200px] border border-[#A3ADFF] rounded-xl p-4 text-[#020E7C] cursor-pointer"   onClick={() => navigate("/patient_signup")}>
          <h1 className="font-bold text-[20px] leading-9">Patients</h1>
          <p className="sm:w-[552px] h-[98px] w-[286px] md:max-w-96 font-normal text-[12px] sm:w[700px] sm:h-[61px]">
           At Medfair, we are committed to enhancing healthcare 
           accessibility for everyone. Our mission is to connect
           individuals seeking high-quality medical care with 
           trusted healthcare professionals who are ready to help. 
           Join our network and experience compassionate, reliable care.

          </p>
          <h2 className="w-[299px] h-[16px] font-semibold text-[12px] flex mt-6 ">
            Be a part of our healthcare professionals.{" "}
            <span>
              <FiArrowUpRight />
            </span>
          </h2>
        </div>
        <div className=" sm:w-[636px] sm:h-[168px] lg:w-[540px] lg:h-[180px] w-[305px] md:w-[430px] md:h-[200px] h-[200px] border border-[#A3ADFF] rounded-xl p-4 text-[#020E7C] mt-4 cursor-pointer" onClick={() => navigate("/patient_signup")}>
          <h1 className="font-bold text-[20px] leading-9">Doctors</h1>
          <p className="sm:w-[552px] h-[98px] w-[286px] md:max-w-96  font-normal text-[12px] sm:w[700px] sm:h-[61px]">
           
              Medfair proudly partners with dedicated medical
              professionals to bring healthcare closer to 
               those who need it. If you’re a healthcare 
               provider passionate about making a difference, 
               we invite you to be part of our community 
              and help us provide quality care for all.

          </p>
          <h2 className="w-[299px] h-[14px] font-semibold text-[12px] flex mt-6 ">
            Be a part of our healthcare professionals.{" "}
            <span>
              <FiArrowUpRight />
            </span>
          </h2>
        </div>
        <div className=" sm:w-[636px] sm:h-[168px] lg:w-[540px] lg:h-[180px] w-[305px] md:w-[430px] md:h-[200px] h-[200px] border border-[#A3ADFF] rounded-xl p-4 text-[#020E7C] mt-4 cursor-pointer" onClick={() => navigate("/patient_signup")}>
          <h1 className="font-bold text-[20px] leading-9">Partners</h1>
          <p className="sm:w-[552px] h-[98px] w-[286px] md:max-w-96  font-normal text-[12px] sm:w[700px] sm:h-[61px]">
            We collaborate with diverse stakeholders who share 
            our vision of accessible healthcare for everyone.
            Your support helps expand our reach and strengthen our impact.
            Partner with us today to be part of a healthcare movement that changes lives.

          </p>
          <h2 className="w-[299px] h-[14px] font-semibold text-[12px] flex mt-6">
            Be a part of our healthcare professionals.{" "}
            <span>
              <FiArrowUpRight />
            </span>
          </h2>
        </div>
        <div className=" sm:w-[636px] sm:h-[168px] lg:w-[540px] lg:h-[180px] md:w-[430px] md:h-[200px]  w-[305px] h-[200px] border border-[#A3ADFF] rounded-xl p-4 text-[#020E7C] mt-4 cursor-pointer" onClick={() => navigate("/patient_signup")}>
          <h1 className="font-bold text-[20px] leading-9">
            Corporate Organization
          </h1>
          <p className="sm:w-[552px]  h-[98px] md:max-w-96  w-[286px] font-normal text-[12px] sm:w[700px] sm:h-[61px]">
            Medfair works closely with corporate organizations
            committed to social responsibility and community welfare. 
             By joining forces, we can improve healthcare accessibility
          </p>
          <h2 className="w-[299px] h-[14px] font-semibold text-[12px] flex mt-6">
            Be a part of our healthcare professionals.{" "}
            <span>
              <FiArrowUpRight />
            </span>
          </h2>
        </div>
        <div className=" sm:w-[636px] sm:h-[168px] md:w-[430px] md:h-[200px] lg:w-[540px] lg:h-[180px] w-[305px] h-[200px] border border-[#A3ADFF] rounded-xl p-4 text-[#020E7C] mt-4 cursor-pointer" onClick={() => navigate("/patient_signup")}>
          <h1 className="font-bold text-[20px] leading-9">Volunteer</h1>
          <p className="sm:w-[552px] h-[98px] md:max-w-96  w-[286px] font-normal text-[12px] sm:w[700px] sm:h-[61px]">
            At Medfair, we carter to a diverse range of stakeholders each
            playing a vital role in our mission to resuccitate healthcare
            accessibilty. From Individuals seeking quality medical care to
          </p>
          <h2 className="w-[299px] h-[14px] font-semibold text-[12px] flex mt-6">
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