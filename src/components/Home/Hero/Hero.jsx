
import React from 'react';
import HeaderSlider from "../reuseable/HeaderSlide";
import { useNavigate } from 'react-router-dom';
const Hero = () => {
  const navigate = useNavigate();
  return (
    <div
      className="w-full relative bg-cover bg-center flex items-center justify-center overflow-hidden"
      style={{ height: 'auto', minHeight: '30vh' }} 
    >
      
      <HeaderSlider />

     
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="sm:text-xl md:font-bold md:text-[50px] md:text-4xl font-roboto text-white">
          Transform Your Physical Presence With{" "}
          <span className="text-[#020E7C] md:font-bold md:text-[45px] font-bold text-[20px]">
            Our Medical Digital Expert
          </span>{" "}
          in Medfair Limited
        </h1>
        <p className="text-[#FFFFFF] text-[12px] mt-2 w-[100%] font-semibold max-w-xl">
          Crafting Experiences, building relationships- Experience the beauty
          of digital medical attention with us. We create long-lasting
          digital medical experiences with ease.
        </p>
        <button className="mt-7 bg-[#020E7C] rounded-md text-white p-3 sm:w-[20%] w-[45%] lg:w-[30%] lg:p-8 lg:font-semibold font-bold text-[20px]" onClick={() => navigate("/patient_signup")}>
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Hero;
