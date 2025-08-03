import React, { useState } from "react";

const Works = () => {
  const teamMembers = [
    {
      name: "Joshua Jordan-Akintoye",
      image:
        "https://res.cloudinary.com/da79pzyla/image/upload/v1737313706/thoye_lo6dy0.jpg",
      role: "CEO",
    },
    {
      name: "Dr. Nwineh Ambassador",
      image:
        "https://res.cloudinary.com/da79pzyla/image/upload/v1754155309/dr_amb_pic_lsglhg.jpg",
      role: "Chief Operating Officer/Medical Team Lead",
    },
    {
      name: "Mr. Olayiwola Akinyemi",
      image:
        "https://res.cloudinary.com/da79pzyla/image/upload/v1754155404/lai_pic_rhvxml.png",
      role: "Chief Finance Officer/Business Development",
    },
    // {
    //   name: "Enubiak Joseph",
    //   image:
    //     "https://res.cloudinary.com/da79pzyla/image/upload/v1737313430/joe_vxz4xs.jpg",
    //   role: "Head of Engineering",
    // },
    {
      name: "Solomon Moregood",
      image:
        "https://res.cloudinary.com/da79pzyla/image/upload/v1737301757/solo_image_isiyn9.jpg",
      role: "Head of Marketing",
    },
  ];
  const [selectedMember, setSelectedMember] = useState(teamMembers[0]);

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  return (
    <div
      className="w-full bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 py-12 px-4 sm:px-6 lg:px-8"
      id="company"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-blue-700 text-sm font-medium mb-6 shadow-lg border border-white/60">
            <span className="mr-2">👥</span>
            The Team
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-indigo-600 bg-clip-text text-transparent leading-tight mb-4">
            Meet Our Team
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex gap-8 min-h-[600px]">
          {/* Image Section */}
          <div className="w-2/5 flex justify-center items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              <img
                src={selectedMember.image}
                alt={selectedMember.name}
                className="relative w-80 h-96 object-cover rounded-3xl shadow-2xl transform transition-all duration-500 group-hover:scale-105"
              />
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                <h3 className="font-bold text-gray-800 text-lg">
                  {selectedMember.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedMember.role}
                </p>
              </div>
            </div>
          </div>

          {/* Team List */}
          <div className="w-3/5 flex flex-col justify-center">
            <div className="space-y-2">
              {teamMembers.map((member, index) => (
                <div
                  key={member.name}
                  onMouseEnter={() => handleMemberClick(member)}
                  className={`group relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                    selectedMember.name === member.name
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white transform scale-105 shadow-xl"
                      : "bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                          selectedMember.name === member.name
                            ? "bg-white/20 text-white"
                            : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        }`}
                      >
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h3
                          className={`text-xl font-bold transition-colors duration-300 ${
                            selectedMember.name === member.name
                              ? "text-white"
                              : "text-gray-800"
                          }`}
                        >
                          {member.name}
                        </h3>
                      </div>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                        selectedMember.name === member.name
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {member.role}
                    </div>
                  </div>
                  <div
                    className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ${
                      selectedMember.name === member.name
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden">
          {/* Mobile Team Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="group relative bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:transform hover:scale-105"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 rounded-3xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>

                <div className="relative">
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-32 mb-4 relative">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-2xl shadow-lg"
                      />
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
                      {member.name}
                    </h3>

                    <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                      <p className="text-sm text-gray-700 text-center font-medium">
                        {member.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Works;
