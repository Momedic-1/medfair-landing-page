import React from "react";
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram, FaLinkedin, FaPhone } from "react-icons/fa";

const ContactUs = () => {
  return (
    <div className="w-full bg-blue-50/20 px-4 md:px-0 md:mt-24" id="contact-us" data-aos="zoom-in-down" data-aos-easing="ease-in-sine" data-aos-duration="1000">
      <div
        className="w-full h-full mt-10 rounded-lg md:rounded-none"
      >
        <div className="flex flex-col items-center gap-y-4 py-10">
          <h4 className="text-[#020E7C] text-2xl font-bold">
             Contact Us
          </h4>
          <p className="font-sans font-normal text-[20px] text-[#475467] text-center">
           Be a step ahead of others 
          </p>
          <div className="w-full mt-4 flex flex-col md:flex-row md:items-center md:justify-center gap-y-2 md:gap-x-4 md:mt-7">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full h-10 rounded-md pl-4 border border-[#D0D5DD] font-sans text-[16px] outline-none md:w-80"
            />
            <p className="text-[#475467] text-14 font-sans font-normal leading-5 md:hidden">
              No spam. Promise
            </p>
            <button className="w-full mt-4 h-10 bg-blue-500 text-white rounded-md font-sans text-16 md:mt-0 md:w-36">
              Stay updated
            </button>
            <p className="text-center text-14 font-sans font-normal leading-5 text-enumPrimaryMain md:hidden">
              Privacy policy
            </p>
          </div>
          <div className="hidden md:flex justify-between items-center w-80 -ml-40">
            <p className="text-[#475467] text-14 font-sans font-normal leading-5">
              No spam. Promise
            </p>
            <p className="text-center text-14 font-sans font-normal leading-5 text-enumPrimaryMain ">
              Privacy policy
            </p>
          </div>
          <div>
            <p className="text-[#475467] text-14 font-sans font-normal leading-5">
              You can reach out to us directly at our social media handles:
            </p>
            <div className="flex justify-center gap-4 mt-4">
             
              <a href="https://x.com/The_Medfair?t=LHZb7Y1ZtZf8D6APbHel2g&s=09" className="text-[#475467] text-14 font-sans font-normal leading-5 hover:text-blue-500">
                <FaXTwitter size={30}/>
              </a>
              <a href="https://www.instagram.com/the_medfair?igsh=YzljYTk1ODg3Zg==" className="text-[#475467] text-14 font-sans font-normal leading-5 hover:text-blue-500">
                <FaInstagram size={30}/>
                </a>
                <a href="https://www.linkedin.com/company/the-medfair" className="text-[#475467] text-14 font-sans font-normal leading-5 hover:text-blue-500">
                <FaLinkedin size={30}/>
                </a>
                </div>
                <p className="mt-6 w-full">Or call us at: </p>
                <div className="w-full flex gap-x-2 mt-4">
                    <FaPhone size={20}/>
                    <p className="text-[#475467] text-14 font-sans font-normal leading-5">+234 806 427 4421</p>
                </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
