import React, { useState } from 'react';


const Works = () => {
  const teamMembers = [
  { name: 'Joshua Jordan-Akintoye', image: 'https://res.cloudinary.com/da79pzyla/image/upload/v1737313706/thoye_lo6dy0.jpg', role: 'CEO' },
  { name: 'Enubiak Joseph', image: 'https://res.cloudinary.com/da79pzyla/image/upload/v1737313430/joe_vxz4xs.jpg', role: 'Head of Engineering' },
  { name: 'Solomon Moregood', image: 'https://res.cloudinary.com/da79pzyla/image/upload/v1737301757/solo_image_isiyn9.jpg', role: 'Head of Marketing' },
  { name: 'Adeniji Ifeoluwa Adesewa', image: 'https://res.cloudinary.com/da79pzyla/image/upload/v1737301421/ife_image_eosbcl.jpg', role: 'Social Media Manager' },

];
 const [selectedMember, setSelectedMember] = useState(teamMembers[0]);

   const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  return (
    <div className="hidden md:flex flex-col bg-blue-50/20 p-8 lg:p-16 mt-3 w-full" 
     data-aos="zoom-in-down"
        data-aos-easing="ease-in-sine"
        data-aos-duration="1000"
        id='company'
    >
      <div className="w-full text-[#020E7C]">
        
          <h2 className="text-2xl font-bold">
            MEET OUR TEAM
          </h2>
          <div className='mt-8 w-full h-[500px] flex gap-x-4 lg:justify-between '>
         <div className="w-[40%] h-full flex justify-center items-center">
            {selectedMember && (
              <div className='sticky top-8 w-full h-full'>
              <img src={selectedMember.image} alt={selectedMember.name} className="shadow-lg w-[400px] h-full object-cover rounded-3xl" />
              </div>
            )}
          </div>
          <div className="w-[60%] h-full flex flex-col justify-start cursor-pointer">
            <ul className="mt-4 lg:w-full">
              {teamMembers.map((member) => (
                <div className='w-full h-24 flex items-center justify-between border-t border-gray-300 hover:border-b hover:text-green-500 hover:border-b-green-500'>
                <li
                  key={member.name}
                  onMouseEnter={() => handleMemberClick(member)}
                  className="md:text-xl lg:text-4xl cursor-pointer"
                >
                  {member.name}
                </li>
                <p className='text-sm rounded-full px-4 bg-gray-600/10 py-2'>{member.role}</p>
                </div>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Works;
