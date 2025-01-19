
import React from 'react';
import HeaderSlider from "../reuseable/HeaderSlide";
import { useNavigate } from 'react-router-dom';
const Hero = () => {
  return (
    <div
      className="w-full relative bg-cover mt-28 md:mt-24 bg-center flex items-center justify-center overflow-hidden px-8"
      id='home'
    >
      
      <HeaderSlider />

     
      <div className="w-full px-10 absolute flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl md:font-bold md:text-[50px] md:text-4xl font-roboto text-white">
          Transform Your Physical Presence With{" "}
          <span className="text-[#020E7C] md:font-bold md:text-[45px] font-bold text-[20px]">
            Our Medical Digital Expert
          </span>{" "}
          in Medfair Limited
        </h1>
      </div>
    </div>
  );
};

export default Hero;
