import React, { useRef, useState, useEffect } from "react";
import logo from "../assets/Frame 7667.png";

const DesktopNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-xl border-b border-white/20"
          : "bg-white/90 backdrop-blur-sm shadow-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <img src={logo} alt="MedFair Logo" className="h-8 lg:ml-12" />

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
              MedFair
            </span>
          </div>

          {/* Navigation Links */}
          <ul className="hidden md:flex items-center space-x-8">
            {[
              { href: "#home", label: "Home", active: true },
              { href: "#company", label: "Company", active: false },
              { href: "#contact-us", label: "Contact Us", active: false },
            ].map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={`relative px-4 py-2 font-semibold text-sm transition-all duration-300 group ${
                    item.active
                      ? "text-blue-700"
                      : "text-gray-600 hover:text-blue-700"
                  }`}
                >
                  {item.label}

                  {/* Active indicator */}
                  {item.active && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </a>
              </li>
            ))}
          </ul>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Login Button */}
            <a
              href="/login"
              className="group relative px-6 py-2.5 border-2 border-blue-600 text-blue-700 text-sm font-bold rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Login</span>
              <div className="absolute inset-0 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </a>

            {/* Sign Up Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                onClick={toggleDropdown}
              >
                <span className="flex items-center gap-2">
                  Sign Up
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>

                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-300"></div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  {/* Dropdown Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-700">
                      Choose your role
                    </p>
                  </div>

                  <ul className="py-2">
                    {[
                      {
                        to: "/doctor_signup",
                        label: "As a Doctor",
                        icon: "👨‍⚕️",
                        description: "Join our medical team",
                      },
                      {
                        to: "/patient_signup",
                        label: "As a Patient",
                        icon: "👤",
                        description: "Get healthcare services",
                      },
                    ].map((item) => (
                      <li key={item.to}>
                        <a
                          href={item.to}
                          className="group flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-lg group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                            {item.icon}
                          </div>
                          <div>
                            <div className="font-semibold text-sm group-hover:text-blue-700 transition-colors duration-300">
                              {item.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.description}
                            </div>
                          </div>
                          <svg
                            className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20"></div>
    </nav>
  );
};

export default DesktopNavbar;
