import React from "react";
import Whatapp from "../assets/logos_whatsapp-icon.png"
import Linkedin from "../assets/linkedein.png";
import Twitter from "../assets/X.png";
import Instagram from "../assets/instagram.png";
import Facebook from "../assets/logos_facebook.png";
import Apple from "../assets/apple.png";
import Play from "../assets/fa6-brands_google-play.png";
import Message from "../assets/message.png";
import Call from "../assets/call.png";
import { FaLinkedin } from "react-icons/fa";
export default function Footer() {
    return (
      <footer className="w-full  bg-[#020E7C]">
        <div className="container text-white mx-auto px-4 p-8">
          <div className="sm:flex flex-wrap justify-around grid grid-cols-2 pb-4">
      
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h2 className="text-xl font-bold mb-4">Company</h2>
              <ul className="text-sm">
                <li className="mb-2">
                  <a href="#" className="hover:underline">Sign Up</a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:underline">Log in</a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:underline">FAQs</a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:underline">Security</a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:underline">Terms of use</a>
                </li>
              </ul>
            </div>
  
           
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h2 className="text-xl font-bold mb-4">Services</h2>
              <ul className="text-sm">
                <li className="mb-2">
                  <a href="#" className="hover:underline">Tele Consultations</a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:underline">Pharmacy </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:underline">Access Doctors</a>
                </li>
                
              </ul>
            </div>
  
           
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h2 className="text-xl font-bold mb-4">Legal Policy</h2>
              <ul className="text-sm">
                <li className="mb-2">
                  <a href="#" className="hover:underline">Whistle Blowing</a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:underline">Refund Policy</a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:underline">Privacy Policy</a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:underline">Cookies</a>
                </li>
              </ul>
            </div>
                    
          </div>
      <div className="flex justify-between items-center gap-3">
        <hr className="sm:w-[43%] w-[35%]"/> <p className="text-[12px] w-[40%]">Get the Medfair App</p> <hr className="sm:w-[43%] w-[35%]"/>
      </div>
      <div className="sm:flex gap-8 mt-6">
      <div className="sm:w-[70%] " >
        <div className="sm:flex flex-wrap justify-end gap-[3rem] flex sm:mr-[9.5rem]">
          <span className="bg-white border border-gray-300 rounded-lg flex sm:w-[15%] md:w-[26%] text-[12px] w-[40%] h-[45px] items-center sm:p-4 text-[#020E7C]">
          <img src={Apple} alt="apple"/>
           
            <p>Apple Store</p>
          </span>
          <span className="bg-white border border-gray-300 rounded-lg flex sm:w-[15%] md:w-[26%] text-[12px] w-[40%] h-[45px] items-center sm:p-4 text-[#020E7C]">
           <img src={Play} alt="playstore"/>
           
            <p>Play Store</p>
          </span>
          
        </div>
        <div className="sm:flex justify-around items-center mt-3">
          <div className="ml-[3rem] mt-4 sm:flex justify-between gap-5 items-center">
          <div className="flex gap-3 items-center mt-2">
        <span className="bg-white border border-gray-300 rounded-full flex items-center justify-center w-10 h-10"  >
        <img src={Call} alt="call"/>
       
      </span>
        </div>
        <div className="flex gap-3 items-center mt-2">
        <span className="bg-white border border-gray-300 rounded-full flex items-center justify-center w-10 h-10"  >
        <img src={Message} alt="message"/>
        
      </span>
      <p>medfairtechnologies@gmail.com</p>
      
        </div>
          </div>
       
        <span>Follow us on :</span>
        </div>
        
      </div>
        <div className="flex items-center gap-x-5 mt-5 cursor-pointer">
        
        <img src={Facebook} alt="facebook" className=""/>
        
       
     <a href="https://www.instagram.com/the_medfair?igsh=YzljYTk1ODg3Zg==" target="_blank" rel="noopener noreferrer" className="hover:underline">
     
        <img src={Instagram} alt="instagram" className="w-7 h-7"/>
    </a>
 

       
        <a href="https://x.com/The_Medfair?t=LHZb7Y1ZtZf8D6APbHel2g&s=09">
        
        <img src={Twitter} alt="X" className="w-7 h-7"/>
      
        </a>
       
        
        <img src={Whatapp} className=""/>
     
     
        
          <a href="https://www.linkedin.com/company/the-medfair">
         
         <FaLinkedin size={30}/>

    
    
          </a>
       
        </div>
      </div>
      <div className="mt-6">

        <p className="text-sm text-white">&copy; {new Date().getFullYear()} <span className="text-white">MEDFAIR</span>  DEVELOPED BY MEDFAIR HEALTH TEAM</p>

     </div>
          
        </div>
        
     
      </footer>
    );
  }