import { Avatar } from '@mui/material'
import React from 'react'
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa'

const Testimonials = () => {
    const testimonials = [
        {
            name: 'Sarah',
            job: 'Banker',
            testimonial: 'As a full-time working mom, I barely have time to schedule doctor visits. MedFair has been a lifesaver! I was able to consult with a physician from the comfort of my home during my lunch break. The process was seamless, and the doctor provided excellent care'
        },
        
        {
            name: ' E.J Itigwe',
            job: 'Civil Servant',
            testimonial: "Living in a rural community, access to healthcare has always been a challenge. Thanks to MedFair, I can now speak with specialists without traveling hours to the city. It's convenient, and the quality of care is just as good as in-person visits."
        },
        {
            name: ' John Clifford',
            job: 'Software Engineer',
            testimonial: 'I was initially skeptical about using a MedFair app, but after my first consultation, I was blown away. The app was user-friendly, the video quality was excellent, and the doctor answered all my questions thoroughly. I now recommend MedFair to all my friends!'
        },

    ]
  return (
    <div className='w-full h-full' data-aos="zoom-out" data-aos-duration="1000" data-aos-easing="ease-in-sine">
        <div className='w-full px-4 py-4 lg:px-8'>

        <p className='text-2xl text-[#020E7C] font-bold'>Testimonies</p>
        </div>
        <div className="px-4 w-full grid md:grid-cols-2 xl:grid-cols-3 h-[60%] py-4 gap-x-6 lg:px-8">
           {testimonials.map((testimony) => ( 
            <div className='h-full rounded-lg shadow-lg p-6' key={testimony.name}>
                <div className='w-full flex items-center gap-x-6' >

                <Avatar src="/broken-image.jpg" />
                <div className='flex flex-col items-start space-y-1'>
                    <p className='text-gray-950/60'>{testimony.name}</p>
                    <p className='text-gray-950/60'>{testimony.job}</p>
                </div>
                </div>
                <div className='w-full flex flex-col gap-y-3 mt-4'>
                    <FaQuoteLeft size={20} className='text-bg-gray-900/60'/>
                    <p className='text-sm italic text-gray-950/60'>{testimony.testimonial}</p>
                    <FaQuoteRight size={20} className='text-bg-gray-900/60'/>
                </div>
            </div>
        ))}
        </div>
    </div>
  )
}

export default Testimonials