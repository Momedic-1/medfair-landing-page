import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram, FaLinkedin, FaPhone, FaEnvelope } from "react-icons/fa";
import { useState } from "react";

const ContactUs = () => {
  const [email, setEmail] = useState("");
  const [isHovered, setIsHovered] = useState(null);

  return (
    <div
      className="w-full relative overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 px-4 md:px-0 md:mt-24"
      id="contact-us"
      data-aos="zoom-in-down"
      data-aos-easing="ease-in-sine"
      data-aos-duration="1000"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-4 md:left-10 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-4 md:right-10 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-r from-purple-300 to-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-emerald-300 to-teal-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 md:w-48 md:h-48 bg-gradient-to-r from-rose-300 to-pink-400 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-300"></div>
      </div>

      {/* Animated mesh gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-pulse"></div>

      {/* Sparkle effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-purple-300 rounded-full animate-ping opacity-40"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-pink-300 rounded-full animate-ping opacity-30 delay-500"></div>
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-blue-300 rounded-full animate-ping opacity-25 delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-ping opacity-20 delay-700"></div>
      </div>

      <div className="relative w-full h-full mt-10 rounded-2xl md:rounded-none backdrop-blur-sm">
        <div className="flex flex-col items-center gap-y-6 py-8 px-4 md:py-12 lg:py-16">
          {/* Header Section */}
          <div className="text-center space-y-3 md:space-y-4 max-w-2xl w-full">
            <div className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 bg-white/95 backdrop-blur-sm rounded-full text-purple-700 text-xs md:text-sm font-medium mb-2 md:mb-4 shadow-lg border border-white/80">
              <FaEnvelope className="mr-1 md:mr-2 text-xs md:text-sm text-purple-600" />
              Get in Touch
            </div>
            <h4 className="text-gray-800 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-pink-600 bg-clip-text text-transparent leading-tight drop-shadow-sm">
              Contact Us
            </h4>
            <p className="font-sans font-medium text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed px-2">
              Be a step ahead of others and join our community
            </p>
          </div>

          {/* Email Subscription Form */}
          <div className="w-full max-w-2xl mt-6 md:mt-8 px-2">
            <div className="bg-white/98 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-xl border border-white/60 ring-1 ring-purple-100/50">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch">
                <div className="flex-1 relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full h-12 md:h-14 rounded-lg md:rounded-xl pl-10 md:pl-12 pr-4 border-2 border-purple-200 font-sans text-sm md:text-[16px] outline-none transition-all duration-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 bg-white/95 focus:bg-white"
                  />
                  <FaEnvelope className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-purple-400 group-focus-within:text-purple-600 transition-colors duration-300 text-sm md:text-base" />
                </div>
                <button
                  className="h-12 md:h-14 px-4 md:px-8 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white rounded-lg md:rounded-xl font-sans font-semibold text-sm md:text-16 transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-200 active:scale-95 whitespace-nowrap shadow-lg"
                  onMouseEnter={() => setIsHovered("button")}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <span className="flex items-center gap-2">
                    <span className="hidden sm:inline">Stay Updated</span>
                    <span className="sm:hidden">Subscribe</span>
                    {isHovered === "button" && (
                      <svg
                        className="w-3 h-3 md:w-4 md:h-4 animate-bounce"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="w-full max-w-lg mt-8 md:mt-12 text-center px-2">
            <p className="text-gray-700 text-base md:text-lg font-medium mb-6 md:mb-8 leading-relaxed">
              Connect with us on social media
            </p>

            <div className="flex justify-center gap-4 md:gap-6 mb-8 md:mb-10">
              {[
                {
                  icon: FaXTwitter,
                  href: "https://x.com/The_Medfair?t=LHZb7Y1ZtZf8D6APbHel2g&s=09",
                  name: "Twitter",
                  color:
                    "hover:bg-gradient-to-r hover:from-gray-800 hover:to-black",
                },
                {
                  icon: FaInstagram,
                  href: "https://www.instagram.com/the_medfair?igsh=YzljYTk1ODg3Zg==",
                  name: "Instagram",
                  color:
                    "hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-orange-500",
                },
                {
                  icon: FaLinkedin,
                  href: "https://www.linkedin.com/company/the-medfair",
                  name: "LinkedIn",
                  color:
                    "hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700",
                },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`group relative w-12 h-12 md:w-16 md:h-16 bg-white/95 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center text-gray-700 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:text-white border border-white/80 shadow-lg ${social.color}`}
                  onMouseEnter={() => setIsHovered(social.name)}
                  onMouseLeave={() => setIsHovered(null)}
                >
                  <social.icon
                    size={
                      typeof window !== "undefined" && window.innerWidth >= 768
                        ? 24
                        : 20
                    }
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                  {isHovered === social.name && (
                    <div className="absolute -top-10 md:-top-12 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-sm text-white text-xs px-2 md:px-3 py-1 md:py-2 rounded-lg opacity-90 whitespace-nowrap shadow-lg">
                      {social.name}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/90"></div>
                    </div>
                  )}
                </a>
              ))}
            </div>

            {/* Phone Contact */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/80 shadow-lg">
              <p className="text-purple-800 font-semibold text-base md:text-lg mb-3 md:mb-4">
                Or call us directly
              </p>
              <div className="flex items-center justify-center gap-2 md:gap-3 group cursor-pointer">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300 shadow-md">
                  <FaPhone
                    className="text-purple-600 group-hover:scale-110 transition-transform duration-300"
                    size={
                      typeof window !== "undefined" && window.innerWidth >= 768
                        ? 18
                        : 16
                    }
                  />
                </div>
                <a
                  href="tel:+2348064274421"
                  className="text-purple-700 text-base md:text-lg font-semibold hover:text-purple-900 transition-colors duration-300"
                >
                  +234 806 427 4421
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
