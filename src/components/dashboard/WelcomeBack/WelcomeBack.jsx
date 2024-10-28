import DoctorImg from '../../../assets/doctor.png'
import call from '../../../assets/call.svg'
import './WelcomeBack.css'
import { useEffect, useState } from 'react';
import { baseUrl } from '../../../env';
import axios from 'axios';

function WelcomeBack () {
  const [activeCall, setActiveCalling] = useState(null);
  const [callStatus, setCallStatus]= useState("");
  const [isActive, setIsActive] = useState(false);
  const token = JSON.parse(localStorage.getItem('authToken'))?.token;
  const userData = JSON.parse(localStorage.getItem('userData'));

  useEffect(() => {    
    viewAllPendingCalls()
  },[]);


  const viewAllPendingCalls = async()=>{
    try {
    const response = await axios.post( `https://momedic.onrender.com/api/call/broadcast`, {}, {
    // const response = await axios.post( `${baseUrl}/api/call/broadcast`,{},{
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      setActiveCalling(response.data.data);
    } catch (error){
      console.error(error);
  // setCalling(true)
}
  }
  const pickCall = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`https://momedic.onrender.com/api/call/join`,{},{
      // const response = await axios.post(`${baseUrl}/api/call/join`,{
        "doctorId": userData?.id,
        "callId": activeCall[0].callId
      },{
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      setIsActive(!isActive);
      window.open(response.data.data, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.log('Error submitting form. Please try again.'+error.message);
      return false;
    }finally{
      // setPaymentSuccess(true);
    }
  };

  return (
    
    <div className='w-[100%]  '>
      {true &&
      <div
        onClick={pickCall}
        style={{ cursor: 'pointer' }}
        className={`image ${isActive ? 'active' : ''} ${activeCall ? 'shake bg-green-500' : 'bg-[#020e7c]'} grid place-items-center mb-4 item-center justify-center w-32 h-24 lg:ml-80 border rounded-lg py-4 mx-auto lg:mx-0 -m-14 `}>
          <p className='text-white font-semibold text-center'>Join<br/>Meeting Room</p>
        <img
        src={call}
        alt={'call'}
        className={`image ${isActive ? 'active' : ''}  ${activeCall ? 'shake bg-green-500' : ''} `}
      />
      </div>}
      
      <div className='flex flex-col overflow-hidden rounded-lg  bg-gradient-to-r from-blue-100 to-blue-300 sm:flex-row shadow-lg border border-[#020e7c]'>
    <div className='flex w-full flex-col p-4 sm:w-2/3 sm:p-8 lg:w-3/5'>
      <h2 className='mb-1 text-xl font-bold text-[#020e7c] md:text-2xl lg:text-4xl'>
        Welcome Back!
      </h2>

      <p className='mb-4 max-w-md text-[#020e7c] font-semibold text-xl text-center items-center justify-center'>
        Doctor A. Buchi
      </p>
    </div>
    <div className='h-44 w-full sm:h-[13rem] sm:w-1/2 lg:w-2/5'>
      <img
        src={DoctorImg}
        loading='lazy'
        alt='Doctor A. Buchi'
        className='h-full w-full object-cover object-center rounded-lg'
      />
    </div>
  </div>
    
  </div>
  )
}

export default WelcomeBack
