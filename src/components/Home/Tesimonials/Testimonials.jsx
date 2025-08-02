import React, { useState } from "react";
import {
  FaQuoteLeft,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      job: "Banker",
      testimonial:
        "As a full-time working mom, I barely have time to schedule doctor visits. MedFair has been a lifesaver! I was able to consult with a physician from the comfort of my home during my lunch break. The process was seamless, and the doctor provided excellent care.",
      rating: 5,
      avatar: "👩‍💼",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      name: "E.J Itigwe",
      job: "Civil Servant",
      testimonial:
        "Living in a rural community, access to healthcare has always been a challenge. Thanks to MedFair, I can now speak with specialists without traveling hours to the city. It's convenient, and the quality of care is just as good as in-person visits.",
      rating: 5,
      avatar: "👨‍💻",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: 3,
      name: "John Clifford",
      job: "Software Engineer",
      testimonial:
        "I was initially skeptical about using a MedFair app, but after my first consultation, I was blown away. The app was user-friendly, the video quality was excellent, and the doctor answered all my questions thoroughly. I now recommend MedFair to all my friends!",
      rating: 5,
      avatar: "👨‍💻",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: 4,
      name: "Maria Rodriguez",
      job: "Teacher",
      testimonial:
        "The convenience of MedFair is unmatched. I can get medical advice without missing work or arranging childcare. The doctors are professional and thorough in their consultations.",
      rating: 5,
      avatar: "👩‍🏫",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const nextSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex + 1) % Math.ceil(testimonials.length / 3)
    );
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + Math.ceil(testimonials.length / 3)) %
        Math.ceil(testimonials.length / 3)
    );
  };

  return (
    <div
      className="w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 py-16 lg:py-24 relative overflow-hidden"
      data-aos="zoom-out"
      data-aos-duration="1000"
      data-aos-easing="ease-in-sine"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-32 left-16 w-40 h-40 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-r from-emerald-200/20 to-teal-200/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Header Section */}
      <div className="w-full px-4 lg:px-20 mb-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-blue-700 text-sm font-medium mb-6 shadow-lg border border-white/60">
            <span className="mr-2">💬</span>
            What Our Patients Say
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-indigo-600 bg-clip-text text-transparent leading-tight mb-4">
            Patient Testimonials
          </h2>
          <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
            Real stories from real patients who've experienced the convenience
            and quality of our healthcare services
          </p>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="px-4 lg:px-20 relative z-10">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimony, index) => (
            <div
              key={testimony.id}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl p-6 lg:p-8 border border-white/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-6">
                <div
                  className={`w-8 h-8 bg-gradient-to-r ${testimony.gradient} rounded-full flex items-center justify-center shadow-lg`}
                >
                  <FaQuoteLeft size={14} className="text-white" />
                </div>
              </div>

              {/* Header with Avatar and Info */}
              <div className="w-full flex items-center gap-4 mb-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${testimony.gradient} rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {testimony.avatar}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                    {testimony.name}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {testimony.job}
                  </p>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(testimony.rating)].map((_, i) => (
                      <FaStar key={i} size={12} className="text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Testimonial Text */}
              <div className="relative">
                <p className="text-gray-700 text-base leading-relaxed italic relative z-10">
                  "{testimony.testimonial}"
                </p>

                {/* Bottom accent */}
                <div
                  className={`absolute bottom-0 left-0 w-12 h-1 bg-gradient-to-r ${testimony.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                ></div>
              </div>

              {/* Hover glow effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${testimony.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
              ></div>
            </div>
          ))}
        </div>

        {/* Navigation for mobile */}
        <div className="flex justify-center items-center gap-4 mt-12 md:hidden">
          <button
            onClick={prevSlide}
            className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/60 hover:scale-105 transition-all duration-300"
          >
            <FaChevronLeft className="text-gray-600" />
          </button>

          <div className="flex gap-2">
            {[...Array(Math.ceil(testimonials.length / 3))].map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index ? "bg-blue-500 w-6" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/60 hover:scale-105 transition-all duration-300"
          >
            <FaChevronRight className="text-gray-600" />
          </button>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { number: "500+", label: "Happy Patients" },
            { number: "50+", label: "Expert Doctors" },
            { number: "24/7", label: "Support" },
            { number: "99%", label: "Satisfaction" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/60"
            >
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600 font-medium mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
