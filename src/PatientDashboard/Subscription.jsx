import React from 'react'
import { ActiveSlide } from './constants'

const Subscription = () => {
  return (
    <div className='w-full px-4'>
         <h1 className="text-2xl text-[#020E7C] font-bold mt-5 cursor-pointer">
        Choose a Subscription Plan
        </h1>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ActiveSlide.map((swipe, index) => (
          <div
            key={index}
            className="flex flex-col w-full min-h-[350px] bg-white p-5 border border-gray-300 rounded-lg shadow-md mb-8"
          >
            <span className="text-blue-600 text-2xl font-bold">{swipe.title}</span>
            <div className="text-4xl font-bold text-[#020E7C] mt-2">{swipe.subTitle}</div>
            <button className="mt-7 w-32  border text-white bg-[#020E7C] py-2 px-4 rounded-3xl" onClick={(e) => handleSubmit(e, swipe.subTitle)}>
              Subscribe
            </button>
            <div className="border-y-2 mt-3" />
            <div className="py-4">
              <ul className="text-gray-950/60 w-full text-lg mb-5 space-y-2">
                {swipe.content.map((content, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-600 mr-2">✔</span> {content}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Subscription