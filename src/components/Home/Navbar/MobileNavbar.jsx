import { useState } from "react";
import logo from "../assets/Frame 7667.png";

const MobileNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <nav className="w-full fixed top-0 left-0 right-0 z-50 md:hidden">
        <div className="mx-4 mt-3 bg-white/95 backdrop-blur-lg rounded-xl border border-gray-200/50 shadow-lg">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-[#020E7C] rounded-lg flex items-center justify-center shadow-sm">
                  <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                    <img src={logo} alt="MedFair Logo" className="h-4" />
                  </div>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <span className="text-[#020E7C] font-bold text-lg">
                  MedFair
                </span>
                <div className="text-xs text-gray-600 font-medium">
                  Healthcare Platform
                </div>
              </div>
            </div>

            <button
              className="w-10 h-10 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors duration-200 border border-gray-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="relative w-5 h-5">
                <div
                  className={`absolute inset-0 transition-all duration-200 ${
                    isMobileMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <div className="w-5 h-0.5 bg-gray-600 rounded-full absolute top-1.5"></div>
                  <div className="w-4 h-0.5 bg-gray-600 rounded-full absolute top-2.5 right-0"></div>
                  <div className="w-5 h-0.5 bg-gray-600 rounded-full absolute top-3.5"></div>
                </div>
                <div
                  className={`absolute inset-0 transition-all duration-200 ${
                    isMobileMenuOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="w-5 h-0.5 bg-gray-600 rounded-full absolute top-2.5 rotate-45"></div>
                  <div className="w-5 h-0.5 bg-gray-600 rounded-full absolute top-2.5 -rotate-45"></div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      <div
        className={`fixed top-16 left-4 right-4 z-50 md:hidden transition-all duration-300 ease-out ${
          isMobileMenuOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white/98 backdrop-blur-lg rounded-xl border border-gray-200/80 shadow-xl p-5">
          <div className="space-y-2 mb-5">
            {[
              {
                href: "#home",
                icon: (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                ),
                title: "Home",
                desc: "Dashboard overview",
              },
              {
                href: "#contact-us",
                icon: (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                ),
                title: "Contact",
                desc: "Get support",
              },
              {
                href: "/login",
                icon: (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                ),
                title: "Login",
                desc: "Access your account",
              },
            ].map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                onClick={closeMobileMenu}
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 group-hover:bg-[#020E7C] group-hover:text-white transition-colors duration-200">
                  {item.icon}
                </div>
                <div className="ml-3 flex-1">
                  <div className="font-medium text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.desc}</div>
                </div>
                <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200">
                  <svg
                    className="w-4 h-4"
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
                </div>
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 mb-4"></div>

          <div className="relative">
            <button
              className="w-full flex items-center justify-between p-4 bg-[#020E7C] hover:bg-[#020E7C]/90 rounded-lg transition-colors duration-200"
              onClick={toggleDropdown}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">Join MedFair</div>
                  <div className="text-white/80 text-sm">
                    Create your account
                  </div>
                </div>
              </div>
              <div
                className={`transform transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              >
                <svg
                  className="w-4 h-4 text-white"
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
              </div>
            </button>

            {/* Dropdown Options */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 space-y-2 bg-white rounded-lg border border-gray-200 shadow-lg p-2">
                <a
                  href="/doctor_signup"
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                  onClick={closeMobileMenu}
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-gray-900">
                      Healthcare Provider
                    </div>
                    <div className="text-sm text-gray-500">
                      Join as a doctor
                    </div>
                  </div>
                </a>

                <a
                  href="/patient_signup"
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                  onClick={closeMobileMenu}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-gray-900">Patient</div>
                    <div className="text-sm text-gray-500">
                      Find healthcare services
                    </div>
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNavbar;
