import React from "react";


const Card = ({ title, description, icon,img }) => {
  return (
    <div className="w-[158px] sm:w-[191px] lg:w-[230px] lg:h-[187px]  sm:h-[190px] md:h-[184px] h-[240px] rounded-xl bg-white border border-[#A3ADFF] p-2 text-[#020E7C] flex flex-col justify-center items-center text-center transition duration-300 ease-in-out hover:bg-[#020E7C] hover:text-white">
      <span className="bg-[#A3ADFF] w-[48px] h-[48px] rounded-full flex items-center justify-center mb-2">
      {icon ? React.createElement(icon, { size: 15 }) : <img src={img} alt={title} className="w-[20px] h-[16px]" />}
      </span>
      <h1 className="mb-2 text-center inline-block font-bold text-[11px] leading-8">
        {title}
      </h1>
      <p className="font-normal text-[14px] leading-7">
        {description}
      </p>
    </div>
  );
};

export default Card;