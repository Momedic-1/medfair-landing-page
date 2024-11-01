import React from "react";


const Card = ({ title, description, icon }) => {
  return (
    <div className="w-[143px] sm:w-[191px] h-[184px] rounded-xl bg-white border border-[#A3ADFF] p-4 text-[#020E7C] flex flex-col justify-center items-center text-center transition duration-300 ease-in-out hover:bg-[#020E7C] hover:text-white">
      <span className="bg-[#A3ADFF] w-[48px] h-[48px] rounded-full flex items-center justify-center mb-2">
      {React.createElement(icon, { size: 15 })}
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