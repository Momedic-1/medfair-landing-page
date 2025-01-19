import React, { useRef, useState, useEffect } from 'react';
import logo from "../assets/Frame 7667.png";
import { Link } from 'react-router-dom';

const DesktopNavbar = () => {
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
    <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-2 bg-white shadow-lg h-auto ">
      <div className="items-center text-[#020E7C] font-bold text-3xl">
        <img src={logo} alt="MedFair Logo" className="h-8 ml-12" />
        <span>MedFair</span>
      </div>

      <ul className="hidden md:flex space-x-6 text-gray-800 font-medium">
        <li><a href="#home" className="text-[#020E7C] font-bold text-[24px]">Home</a></li>
        <li>
          <div className="flex items-center space-x-1">
            <a href="#company" className="text-[#50555C] font-bold text-[24px] hover:text-blue-500">Company</a>
          </div>
        </li>
        <li><a href="#contact-us" className="text-[#50555C] font-bold text-[24px] hover:text-blue-500">Contact Us</a></li>
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
                  <Link to="/doctor_signup" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    As a Doctor
                  </Link>
                </li>
                <li>
                  <Link to="/patient_signup" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    As a Patient
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default DesktopNavbar;
