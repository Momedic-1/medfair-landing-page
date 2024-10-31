

import React from 'react';
import { services } from '../reuseable/Content'; 
import Card from '../reuseable/Card'; 

const Works = () => {
  return (
    <div className="bg-[#E5E9F0] p-16 mt-3">
      <div className="flex justify-center text-[#020E7C]">
        <div>
          <h2 className="font-normal text-[15px] leading-10 ml-[2rem]">
            OUR SERVICES
          </h2>
          <div>
            <h1 className="font-bold sm:text-[35px] text-[20px] leading-10">
              What We Offer
            </h1>
          </div>
        </div>
      </div>
      <p className="text-center text-[#020E7C] font-normal text-[12px] leading-9">
        “Discover the Range of Amazing Features We Offer for Your Well-Being”
      </p>

      <div className="grid grid-cols-2 gap-12 mt-8 ml-[-2rem] md:grid-cols-2 md:ml-[9rem] lg:grid-cols-3  sm:grid-cols-3 sm:ml-[0rem]">
        {services.map((service, index) => (
          <Card
            key={index}
            title={service.title}
            description={service.description}
            icon={service.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default Works;
