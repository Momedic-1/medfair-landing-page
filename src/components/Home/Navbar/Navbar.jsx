

import React, { useState, useEffect, useRef } from 'react';
import logo from "../assets/Frame 7667.png";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  const dropdownRef = useRef(null); 

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
  
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }


    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <nav className="flex items-center justify-between px-6 py-2 bg-white shadow-lg h-auto">
      <div className="items-center text-[#020E7C] font-bold text-3xl">
        <img src={logo} alt="MedFair Logo" className="h-8 ml-12" />
        <span>MedFair</span>
      </div>

      <ul className="hidden md:flex space-x-6 text-gray-800 font-medium">
        <li><a href="#home" className="text-[#020E7C] font-bold text-[24px]">Home</a></li>
        <li>
          <div className="flex items-center space-x-1">
            <a href="#services" className="text-[#50555C] font-bold text-[24px] hover:text-blue-500">Services</a>
          </div>
        </li>
        <li><a href="#about" className="text-[#50555C] font-bold text-[24px] hover:text-blue-500">About Us</a></li>
      </ul>

      <div className="hidden md:flex space-x-5">
      <li className=' list-none mt-2'>
      <a href="/login" className="px-4 py-2 border border-[#020E7C] text-[#020E7C] rounded-md hover:bg-blue-100">
       Login
       </a>
         </li>


        <div className="relative" ref={dropdownRef}> 
          <button
            className="px-4 py-2 bg-[#020E7C] text-white rounded-md hover:bg-blue-600 z-10"
            onClick={toggleDropdown}
          >
            Sign Up
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-20">
              <ul>
                <li>
                  <a
                    href="/doctor_signup"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    As a Doctor
                  </a>
                </li>
                <li>
                  <a
                    href="/patient_signup"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    As a Patient
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden flex items-center">
        <button
          className="text-2xl text-[#020E7C]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✖' : '☰'}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute -top-6 left-0 right-0 w-full bg-[#020E7C] text-white font-medium md:hidden flex flex-col items-center shadow-lg z-10">
          <div className="flex items-center justify-between w-full px-6 py-4 -mb-6">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="MedFair Logo" className="" />
              <span className="text-lg font-bold">MedFair</span>
            </div>
            <button
              className="text-2xl text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ✖
            </button>
          </div>

          <ul className="flex flex-col items-center space-y-4 py-4 w-full">
            <li><a href="#home" className="text-white">Home</a></li>
            <li>
              <div className="flex items-center space-x-1">
                <a href="#services" className="text-white hover:text-blue-300">Services</a>
              </div>
            </li>

            <div className="flex flex-col space-y-4 w-full items-center">
            <li>
              <a href='/login'>Login</a>
            </li>
              {/* <button className="px-4 py-2 border border-white text-white rounded-md hover:bg-blue-300">
               
                Login
              </button> */}

              <div className="relative">
                <button
                  className="px-4 py-2 bg-white text-[#020E7C] rounded-md hover:bg-blue-300"
                  onClick={toggleDropdown}
                >
                  Sign Up
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-20">
                    <ul>
                      <li>
                        <a
                          href="/doctor_signup"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          As a Doctor
                        </a>
                      </li>
                      <li>
                        <a
                          href="/patient_signup"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          As a Patient
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
