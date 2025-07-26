import React, { useState } from 'react';
import logo from "../assets/Frame 7667.png";
import { Link } from 'react-router-dom';

const MobileNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="w-full fixed top-0 z-50 md:hidden flex items-center justify-between px-6 py-2 bg-white shadow-lg">
      <div className="items-center text-[#020E7C] font-bold text-2xl">
        <img src={logo} alt="MedFair Logo" className="h-8 ml-8" />
        <span>MedFair</span>
      </div>
      <button
        className="text-2xl text-[#020E7C]"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? '✖' : '☰'}
      </button>

      {isMobileMenuOpen && (
        <div className="absolute top-0 left-0 right-0 w-full bg-[#020E7C] text-white font-medium flex flex-col items-center shadow-lg z-10">
          <div className="flex items-center justify-between w-full px-6 py-4 bg-[#020E7C]">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="MedFair Logo" className="h-8" />
              <span className="text-lg font-bold text-white">MedFair</span>
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
            <li><a href="#contact-us" className="text-white">Contact us</a></li>
            <li><a href='/login' className="text-white font-extrabold">Login</a></li>
            <div className="flex flex-col space-y-4 w-full items-center">
              <div className="relative">
                <button
                  className="px-4 py-2 bg-white text-[#020E7C] rounded-md hover:bg-blue-300 font-extrabold"
                  onClick={toggleDropdown}
                >
                  Sign Up
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    <Link to="/doctor_signup" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      As a Doctor
                    </Link>
                    <Link to="/patient_signup" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      As a Patient
                    </Link>
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

export default MobileNavbar;
