import React from "react";

const Offer = () => {
  const [activeTab, setActiveTab] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [activeImage, setActiveImage] = React.useState(0);

  const tabs = [
    {
      id: 0,
      title: "Availability",
      content:
        "Book an appointment 24 hours a day and 7 days a week, with doctors always ready on standby to serve and attend to your needs",
      image:
        "https://res.cloudinary.com/da79pzyla/image/upload/v1737299447/tele3_nknjae.jpg",
      icon: "🕐",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: 1,
      title: "Security and Data Privacy",
      content:
        "Experience secure and confidential consultations, with your privacy fully protected. We ensure your data are protected and meant for you alone.",
      image:
        "https://res.cloudinary.com/da79pzyla/image/upload/v1737299447/tele4_iuvbms.jpg",
      icon: "🛡️",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: 2,
      title: "Patient Support",
      content:
        "Dedicated support around the clock, ensuring you're never alone when you need assistance or medical guidance.",
      image:
        "https://res.cloudinary.com/da79pzyla/image/upload/v1737299447/tele7_cowogr.jpg",
      icon: "💬",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  React.useLayoutEffect(() => {
    setProgress(0);
    if (tabs.some((tab) => tab.id === activeTab)) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            setActiveTab((prevTab) => (prevTab + 1) % tabs.length);
            return 0;
          }
          const diff = Math.random() * 5;
          return Math.min(oldProgress + diff, 100);
        });
      }, 200);

      return () => {
        clearInterval(timer);
      };
    } else {
      setProgress(0);
    }
  }, [activeTab, tabs.length]);

  React.useEffect(() => {
    if (tabs.some((tab) => tab.id === activeTab)) {
      setActiveImage(tabs[activeTab].image);
    }
  }, [activeTab]);

  return (
    <div
      className="w-full mt-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 px-4 py-16 relative overflow-hidden"
      id="offer"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-200/30 to-cyan-200/30 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-16 w-40 h-40 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-emerald-200/30 to-teal-200/30 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full flex justify-center relative z-10">
        <div className="text-center max-w-3xl">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-blue-700 text-sm font-medium mb-6 shadow-lg border border-white/60">
            <span className="mr-2">✨</span>
            Our Advantages
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-gray-800 font-bold leading-tight font-sans bg-gradient-to-r from-gray-800 via-blue-700 to-indigo-600 bg-clip-text text-transparent">
            Why Choose Us?
          </h2>
          <p className="mt-4 text-lg text-gray-600 font-medium max-w-2xl mx-auto">
            Discover the benefits that make us your trusted healthcare partner
          </p>
        </div>
      </div>

      <div className="w-full flex flex-col py-12 md:py-20 md:px-6 lg:px-20 md:flex-row gap-8 md:gap-12 relative z-10">
        <div className="w-full md:w-1/2 space-y-2">
          {tabs.map((item, index) => (
            <div key={item.id} className="flex items-start gap-x-6 group">
              <div className="relative flex flex-col items-center">
                <button
                  className="w-2 cursor-pointer relative overflow-hidden"
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    backgroundColor:
                      activeTab === item.id ? "#3B82F6" : "#F1F5F9",
                    borderRadius: "16px",
                    height: activeTab === item.id ? "200px" : "80px",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow:
                      activeTab === item.id
                        ? "0 8px 32px rgba(59, 130, 246, 0.3)"
                        : "0 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {activeTab === item.id && (
                    <div
                      className="absolute top-0 left-0 w-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-2xl transition-all duration-300 ease-out"
                      style={{
                        height: `${progress}%`,
                        boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
                      }}
                    />
                  )}
                </button>
                {index < tabs.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                )}
              </div>

              <div className="w-full flex flex-col gap-y-4 mb-8">
                <div
                  className="flex items-center gap-3 cursor-pointer group-hover:transform group-hover:translate-x-1 transition-all duration-300"
                  onClick={() => setActiveTab(item.id)}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-gradient-to-r ${
                      item.gradient
                    } ${
                      activeTab === item.id
                        ? "shadow-lg scale-110"
                        : "opacity-70"
                    } transition-all duration-300`}
                  >
                    {item.icon}
                  </div>
                  <h4
                    className={`text-xl md:text-2xl leading-tight font-sans font-bold transition-all duration-300 ${
                      activeTab === item.id
                        ? "text-gray-800 bg-gradient-to-r from-gray-800 to-blue-700 bg-clip-text text-transparent"
                        : "text-gray-600 group-hover:text-gray-800"
                    }`}
                  >
                    {item.title}
                  </h4>
                </div>

                <div
                  className={`w-full transition-all duration-500 ease-in-out ${
                    activeTab === item.id
                      ? "max-h-96 opacity-100 transform translate-y-0"
                      : "max-h-0 opacity-0 transform -translate-y-4 overflow-hidden"
                  }`}
                >
                  <div className="w-full bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-lg">
                    <p className="text-lg font-sans text-gray-700 font-medium leading-relaxed">
                      {item.content}
                    </p>
                    {/* <div className="mt-4 flex items-center text-blue-600 font-semibold text-sm cursor-pointer hover:text-blue-700 transition-colors duration-200">
                      <span>Learn more</span>
                      <svg
                        className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200"
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
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full px-4 md:w-1/2 flex justify-center items-start md:px-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl transform scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-2 rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
              <img
                src={activeImage}
                className="w-full h-auto rounded-2xl shadow-lg transition-all duration-700 ease-in-out transform hover:scale-105"
                alt={`Feature ${activeTab + 1}`}
                style={{
                  filter: "brightness(1.05) contrast(1.1) saturate(1.1)",
                }}
              />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/60">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full bg-gradient-to-r ${tabs[activeTab]?.gradient} animate-pulse`}
                    ></div>
                    <span className="text-sm font-semibold text-gray-700">
                      {tabs[activeTab]?.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offer;
