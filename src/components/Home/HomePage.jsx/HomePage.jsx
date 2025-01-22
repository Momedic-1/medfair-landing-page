import React from 'react'
import Navbar from '../Navbar/Navbar'
import Hero from '../Hero/Hero'
import Footer from '../reuseable/Footer'
import HowItWorks from '../HowItWorks/HowItWorks'
import Works from '../works/Works'
import ContactUs from '../Contact/ContactUs'
import FAQs from '../FAQs/FAQs'
import Testimonials from '../Tesimonials/Testimonials'
import Offer from '../Offer/Offer'

const HomePage = () => {
  return (
    <div className='max-w-full'>
        <Navbar/>
        <Hero/>
        <Offer/>
        {/* <HowItWorks/>    */}
        <Works/>
        <Testimonials/>
        <ContactUs/>
        <FAQs/>
       <Footer/>  
    
    </div>
  )
}

export default HomePage