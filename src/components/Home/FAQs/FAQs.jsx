import React, { useState } from "react";

const faqsData = [
  {
    id: 1,
    title: "What is MedFair?",
    content:
      "MedFair is a telemedicine platform that connects patients with qualified healthcare providers. It offers convenient access to medical care and services through an easy-to-use app.",
    icon: "🏥",
  },
  {
    id: 2,
    title: "How does MedFair protect my medical information?",
    content:
      "MedFair employs advanced security measures to ensure the confidentiality and safety of your medical data, adhering to industry standards for data protection.",
    icon: "🔒",
  },
  {
    id: 3,
    title: "What services are available on the MedFair platform?",
    content:
      "MedFair provides virtual consultations, appointment scheduling, and personalized healthcare resources, all designed to make medical care more accessible.",
    icon: "📋",
  },
  {
    id: 4,
    title: "Is MedFair available in my area?",
    content:
      "MedFair is continuously expanding its services to new regions. Check our coverage map or contact support to see if MedFair is available in your location.",
    icon: "📍",
  },
  {
    id: 5,
    title: "How do I start using MedFair?",
    content:
      "Simply create an account through our app or website, complete your profile, verify your information, and follow the setup instructions to begin accessing our services.",
    icon: "🚀",
  },
  {
    id: 6,
    title: "What are the costs of using MedFair?",
    content:
      "MedFair offers both basic and premium services with transparent pricing. Pricing details can be found within the web app or by contacting our support team.",
    icon: "💰",
  },
  {
    id: 7,
    title: "How do I contact MedFair support?",
    content:
      "You can reach MedFair's customer support via our social media pages, through our official website, or directly through the app's help section.",
    icon: "📞",
  },
  {
    id: 8,
    title: "What sets MedFair apart from other telemedicine platforms?",
    content:
      "MedFair stands out for its user-friendly interface, affordable pricing, enhanced confidentiality measures, and a wide network of trusted healthcare providers.",
    icon: "⭐",
  },
];

const FAQs = () => {
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [expandedMobile, setExpandedMobile] = useState(null);
  const [hoveredQuestion, setHoveredQuestion] = useState(null);

  const toggleMobileAccordion = (index) => {
    setExpandedMobile(expandedMobile === index ? null : index);
  };

  const handleQuestionInteraction = (index) => {
    setSelectedQuestion(index);
  };

  const handleMouseEnter = (index) => {
    setHoveredQuestion(index);
    setSelectedQuestion(index);
  };

  const handleMouseLeave = () => {
    setHoveredQuestion(null);
    // Keep the last selected question when mouse leaves - no change needed
  };

  return (
    <div
      className="w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 px-4 py-16 lg:py-24 relative overflow-hidden"
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-easing="ease-in-sine"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-32 right-16 w-40 h-40 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-emerald-200/20 to-teal-200/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Mobile Version */}
      <div className="block w-full lg:hidden relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-blue-700 text-sm font-medium mb-6 shadow-lg border border-white/60">
            <span className="mr-2">❓</span>
            Got Questions?
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-indigo-600 bg-clip-text text-transparent leading-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
            Everything you need to know about MedFair and our services
          </p>
        </div>

        {/* Mobile Accordion */}
        <div className="w-full space-y-4 max-w-4xl mx-auto">
          {faqsData.map((faq, index) => (
            <div
              key={faq.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/60 overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/90 transition-all duration-300"
                onClick={() => toggleMobileAccordion(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-lg shadow-md">
                    {faq.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {faq.title}
                  </h3>
                </div>
                <div
                  className={`transform transition-transform duration-300 ${
                    expandedMobile === index ? "rotate-45" : "rotate-0"
                  }`}
                >
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedMobile === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-l-4 border-blue-500">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Version */}
      <div className="hidden lg:block relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-blue-700 text-sm font-medium mb-6 shadow-lg border border-white/60">
            <span className="mr-2">❓</span>
            Got Questions?
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-indigo-600 bg-clip-text text-transparent leading-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
            Everything you need to know about MedFair and our services
          </p>
        </div>

        {/* Desktop Split Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/60">
            <div className="flex h-[700px]">
              {/* Questions Side */}
              <div className="w-1/2 p-8 border-r border-gray-200/50">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">
                    ❓
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-blue-700 bg-clip-text text-transparent">
                    Questions
                  </h3>
                </div>

                <div className="overflow-y-auto h-[550px] pr-4 space-y-3">
                  {faqsData.map((faq, index) => (
                    <div
                      key={faq.id}
                      className={`group p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                        selectedQuestion === index
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg scale-105"
                          : "bg-white/70 hover:bg-white border-transparent hover:shadow-md hover:scale-102"
                      }`}
                      onClick={() => handleQuestionInteraction(index)}
                      onMouseEnter={() => handleMouseEnter(index)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 ${
                            selectedQuestion === index
                              ? "bg-white/20 backdrop-blur-sm"
                              : "bg-gradient-to-r from-blue-500 to-purple-600 text-white group-hover:scale-110"
                          }`}
                        >
                          {faq.icon}
                        </div>
                        <h4
                          className={`font-semibold text-lg transition-colors duration-300 ${
                            selectedQuestion === index
                              ? "text-white"
                              : "text-gray-800 group-hover:text-blue-700"
                          }`}
                        >
                          {faq.title}
                        </h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Answer Side */}
              <div className="w-1/2 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">
                      💡
                    </div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-emerald-700 bg-clip-text text-transparent">
                      Answer
                    </h3>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/60 min-h-[400px] flex flex-col justify-center transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-lg">
                        {faqsData[selectedQuestion]?.icon}
                      </div>
                      <h4 className="text-xl font-bold text-gray-800">
                        {faqsData[selectedQuestion]?.title}
                      </h4>
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {faqsData[selectedQuestion]?.content}
                    </p>

                    {/* Decorative elements */}
                    <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>
                        Question {selectedQuestion + 1} of {faqsData.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto shadow-lg border border-white/60">
            <p className="text-gray-700 mb-4">Still have questions?</p>
            <a href="#contact-us">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
                Contact Support
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQs;
