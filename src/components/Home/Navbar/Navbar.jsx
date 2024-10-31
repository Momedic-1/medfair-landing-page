
import React, { useState } from 'react';
import logo from "../assets/Frame 7667.png";
import chevron from "../assets/chevron-down.png";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between px-6 py-2  bg-white shadow-lg  h-auto">
     
      <div className=" items-center text-[#020E7C] font-bold text-lg  mb-9">
        <img src={logo} alt="MedFair Logo" className="h-8 relative ml-5" />
        <span>MedFair</span>
      </div>

      <ul className="hidden md:flex space-x-6 text-gray-800 font-medium ">
        <li><a href="#home" className="text-[#020E7C]">Home</a></li>
        <li>
          <div className="flex items-center space-x-1 ">
            <a href="#services" className="text-[#50555C] hover:text-blue-500">Services</a>
            <img src={chevron} alt="chevron" className="w-4 h-4" />
          </div>
        </li>
     
        <li><a href="#about" className="text-[#50555C] hover:text-blue-500">About Us</a></li>
      </ul>

     
      <div className="md:hidden flex items-center">
        <button
          className="text-2xl text-[#020E7C]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✖' : '☰'}
        </button>
      </div>

      
      <div className="hidden md:flex space-x-5">
        <button className="px-4 py-2 border border-[#020E7C] text-[#020E7C] rounded-md hover:bg-blue-100">
          Login
        </button>
        <button className="px-4 py-2 bg-[#020E7C] text-white rounded-md hover:bg-blue-600">
          Sign Up
        </button>
      </div>

    
      {isMobileMenuOpen && (
        <ul className="absolute top-16 left-0 w-full bg-white text-gray-800 font-medium md:hidden flex flex-col items-center space-y-4 py-4 shadow-lg">
          <li><a href="#home" className="text-[#020E7C]">Home</a></li>
          <li>
            <div className="flex items-center space-x-1">
              <a href="#services" className="text-[#50555C] ml-6 hover:text-blue-500">Services</a>
              <img src={chevron} alt="chevron" className="w-4 h-4" />
            </div>
          </li>
          <li><a href="#pricing" className="text-[#50555C] hover:text-blue-500">Pricing</a></li>
          <li><a href="#partners" className="text-[#50555C] hover:text-blue-500">Partners</a></li>
          <li><a href="#about" className="text-[#50555C] hover:text-blue-500">About Us</a></li>

          
          <div className="flex flex-col space-y-4 w-full items-center">
            <button className="px-4 py-2 border border-[#020E7C] text-[#020E7C] rounded-md hover:bg-blue-100">
              Login
            </button>
            <button className=" px-4 py-2 bg-[#020E7C] text-white rounded-md hover:bg-blue-600">
              Sign Up
            </button>
          </div>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
