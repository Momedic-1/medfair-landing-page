import React from 'react'

const Cards = ({ title,img, handleClick }) => {
  return (
   <div onClick={handleClick} className="w-full h-[240px] rounded-xl bg-white shadow-lg p-2 text-[#020E7C] gap-y-8 mb-4 lg:mb-0 flex flex-col justify-center cursor-pointer hover:scale-105 transition-transform duration-300 py-4 lg:gap-y-4 items-center">
         <img src={img} className='w-20 h-20 object-cover' />
         <p className='text-lg font-bold'>
            {title}
         </p>
       </div>
  )
}

export default Cards