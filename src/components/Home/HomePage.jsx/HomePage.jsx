import React from 'react'
import Navbar from '../Navbar/Navbar'
import Hero from '../Hero/Hero'
 import Footer from '../reuseable/Footer'
import Offer from '../offer/Offer'
import HowItWorks from '../HowItWorks/HowItWorks'
import Works from '../works/Works'
import Benefit from '../benefits/Benefit'

const HomePage = () => {
  return (
    <div className=''>
        <Navbar/>
        <Hero/>
          <Offer/> 
        <HowItWorks/>   
        <Works/>
        <Benefit/>
       <Footer/>  
    </div>
  )
}

export default HomePage