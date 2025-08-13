import React from "react";
import { useNavigate } from "react-router-dom";
import medfair from "../../../src/assets/medfair (2).svg";

const PersonIcon = () => (
  <svg
    className="w-full h-full"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="200" height="200" rx="20" fill="url(#gradient1)" />
    <circle cx="100" cy="80" r="30" fill="white" opacity="0.9" />
    <path
      d="M60 160 Q100 140 140 160"
      stroke="white"
      strokeWidth="8"
      strokeLinecap="round"
      opacity="0.9"
    />
    <defs>
      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
      </linearGradient>
    </defs>
  </svg>
);

const DesignedSideBar = () => {
  const navigate = useNavigate();
  const toHomePage = () => {
    navigate("/");
  };

  return (
    <div className="w-full lg:w-1/3 bg-gradient-to-br from-[#020E7C] via-blue-700 to-indigo-800 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full transform -translate-x-12 translate-y-12"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white rounded-full opacity-50"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="lg:hidden w-full flex items-center justify-between">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32">
              <PersonIcon />
            </div>
          </div>

          <button
            className="flex flex-col items-center space-y-2 hover:transform hover:scale-105 transition-all duration-300 group"
            onClick={toHomePage}
          >
            <div className="w-12 h-12 md:w-20 md:h-20 drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300">
              <img
                src={medfair}
                alt="Design Icon"
                className="h-14 w-16"
              />
            </div>
            <div className="text-center">
              <h1 className="text-white font-bold text-lg md:text-xl tracking-wide">
                MEDFAIR
              </h1>
              <p className="text-white/80 text-xs font-medium">
                Healthcare Platform
              </p>
            </div>
          </button>
        </div>

        <div className="hidden lg:flex flex-col items-center justify-center gap-12 space-y-8 text-center">
          <div className="w-48 h-48 xl:w-56 xl:h-56 drop-shadow-2xl">
            <PersonIcon />
          </div>

          <div className="space-y-6">
            <button
              className="flex flex-col items-center justify-center space-y-4 hover:transform hover:scale-105 transition-all duration-300 group"
              onClick={toHomePage}
            >
              <div className="w-20 h-20 drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300">
                <img
                  src={medfair}
                  alt="Design Icon"
                  className="md:h-20 h-16 w-20"
                />
              </div>
              <div className="text-center">
                <h1 className="text-white font-bold text-2xl xl:text-3xl tracking-wide mb-2">
                  MEDFAIR
                </h1>
                <p className="text-white/90 text-sm font-medium">
                  Professional Healthcare Platform
                </p>
              </div>
            </button>

            <div className="space-y-3 text-white/80">
              <div className="w-16 h-px bg-white/30 mx-auto"></div>
              <p className="text-sm leading-relaxed max-w-xs">
                Connecting patients with healthcare professionals for better
                care and outcomes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-white/70 text-xs">
            {/* <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
              <span>Secure & HIPAA Compliant</span>
            </div> */}
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              <span>24/7 Professional Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
              <span>Trusted by Healthcare Providers</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>
    </div>
  );
};

export default DesignedSideBar;
