import React from "react";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();
  const steps = [
    {
      id: 1,
      icon: "👤",
      title: "Account Creation",
      description:
        "Create your account to get started. Fill in your details to register and unlock access to our services.",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      id: 2,
      icon: "✅",
      title: "Verify Your Account",
      description:
        "Check your email for the OTP verification code. Enter the code to verify your account and secure your information.",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
    },
    {
      id: 3,
      icon: "🚀",
      title: "Login and Start Enjoying the Services",
      description:
        "Once verified, log in to access our services, including booking appointments, video/voice calls, and more.",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
  ];

  const handleCreateAccount = () => {
    navigate("/patient_signup");
  };

  return (
    <div
      className="flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 px-4 py-8 sm:py-12 md:py-16 lg:px-20 lg:py-24 w-full relative overflow-hidden"
      data-aos="zoom-in-down"
      data-aos-easing="ease-in-sine"
      data-aos-duration="1000"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-20 sm:w-40 h-20 sm:h-40 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute bottom-16 sm:bottom-32 right-8 sm:right-16 w-24 sm:w-48 h-24 sm:h-48 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-2xl sm:blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 sm:left-1/3 w-16 sm:w-32 h-16 sm:h-32 bg-gradient-to-r from-emerald-200/20 to-teal-200/20 rounded-full blur-xl sm:blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Header Section */}
      <div className="w-full flex justify-center relative z-10 mb-8 sm:mb-12 lg:mb-16">
        <div className="text-center max-w-3xl">
          <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-blue-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6 shadow-lg border border-white/60">
            <span className="mr-2">🎯</span>
            Simple Process
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-indigo-600 bg-clip-text text-transparent leading-tight px-4">
            Get Started with Your Account
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 font-medium max-w-2xl mx-auto px-4">
            Follow these simple steps to begin your healthcare journey with us
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8 sm:gap-12 lg:gap-20 relative z-10">
        {/* Steps Section */}
        <div className="w-full lg:w-1/2 space-y-6 sm:space-y-8">
          {steps.map((step, index) => (
            <div key={step.id} className="group relative">
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 sm:left-8 top-16 sm:top-20 w-0.5 h-12 sm:h-16 bg-gradient-to-b from-gray-300 to-gray-200"></div>
              )}

              <div className="flex justify-start items-start gap-4 sm:gap-6 transform transition-all duration-300 hover:translate-x-1 sm:hover:translate-x-2">
                {/* Step Icon */}
                <div
                  className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-r ${step.gradient} flex items-center justify-center text-xl sm:text-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex-shrink-0`}
                >
                  <span className="filter drop-shadow-sm">{step.icon}</span>
                  <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="text-xs font-bold text-gray-700">
                      {step.id}
                    </span>
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`bg-gradient-to-r ${step.bgGradient} rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/60 shadow-lg group-hover:shadow-xl transition-all duration-300 backdrop-blur-sm`}
                  >
                    <h2 className="font-bold text-lg sm:text-xl text-gray-800 mb-2 sm:mb-3 group-hover:text-blue-700 transition-colors duration-300">
                      {step.title}
                    </h2>
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                      {step.description}
                    </p>

                    {/* Progress indicator */}
                    <div className="mt-3 sm:mt-4 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${step.gradient} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
                        Step {step.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Image Section */}
        <div className="mt-8 sm:mt-10 lg:mt-0 lg:w-1/2 flex justify-center relative w-full">
          <div className="relative group max-w-sm sm:max-w-md lg:max-w-lg w-full">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl scale-110 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

            {/* Image container */}
            <div className="relative bg-white/70 backdrop-blur-sm p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/60">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-2xl sm:rounded-3xl"></div>

              {/* Placeholder for frame image */}
              <div className="relative w-full aspect-square bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden shadow-inner">
                {/* You would replace this div with: <img src={frame} alt="Frame" className="w-full h-full object-cover rounded-xl sm:rounded-2xl" /> */}
                <div className="text-center p-4 sm:p-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl shadow-lg">
                    📱
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">
                    Your Healthcare App
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Ready to get started?
                  </p>
                </div>

                {/* Floating elements */}
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-ping"></div>
                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 w-2 h-2 bg-purple-400 rounded-full animate-ping delay-500"></div>
                <div className="absolute top-1/2 left-3 sm:left-4 w-2 h-2 bg-pink-400 rounded-full animate-ping delay-1000"></div>
              </div>

              {/* Status badge */}
              <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white/90 backdrop-blur-md rounded-full px-4 sm:px-6 py-1.5 sm:py-2 shadow-lg border border-white/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      Ready to Start
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="w-full flex justify-center mt-12 sm:mt-16 relative z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-white/60 max-w-xs sm:max-w-md w-full mx-4 text-center">
          <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
            Ready to get started?
          </p>
          <button
            onClick={handleCreateAccount}
            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer text-sm sm:text-base"
          >
            Create Account Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
