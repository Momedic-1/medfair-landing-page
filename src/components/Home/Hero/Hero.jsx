
import React from "react";
import HeaderSlider from "../reuseable/HeaderSlide";
const Hero = () => {
  return (
    <div
      className="w-full bg-cover mt-24 md:mt-20 bg-center flex items-center justify-center overflow-hidden px-3 sm:px-4 md:px-8"
      id="home"
    >
      <div className="w-full max-w-7xl">
        <HeaderSlider />
      </div>
    </div>
  );
};

export default Hero;
