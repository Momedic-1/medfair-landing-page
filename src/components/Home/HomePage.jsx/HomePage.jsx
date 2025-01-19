import React from 'react'
import Navbar from '../Navbar/Navbar'
import Hero from '../Hero/Hero'
 import Footer from '../reuseable/Footer'
import Offer from '../offer/Offer'
import HowItWorks from '../HowItWorks/HowItWorks'
import Works from '../works/Works'
import Benefit from '../benefits/Benefit'
import ContactUs from '../Contact/ContactUs'
import FAQs from '../FAQs/FAQs'
import Testimonials from '../Tesimonials/Testimonials'

const HomePage = () => {
  return (
    <div className='w-full'>
        <Navbar/>
        <Hero/>
          <Offer/> 
        <HowItWorks/>   
        <Works/>
        <Testimonials/>
        <ContactUs/>
        <FAQs/>
       <Footer/>  
    
    </div>
  )
}

export default HomePage