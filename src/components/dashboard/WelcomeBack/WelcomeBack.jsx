import DoctorImg from '../../../assets/doctor.png'
import call from '../../../assets/call.svg'
import './WelcomeBack.css'
import { useEffect, useState } from 'react';
import { baseUrl } from '../../../env';
import axios from 'axios';

function WelcomeBack () {
  const [isCalling, setCalling] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const token = JSON.parse(localStorage.getItem('authToken')).token;
  
  useEffect(() => {    
    viewAllPendingCalls()
  },[]);


  const viewAllPendingCalls = async()=>{
    try {
    const response = await axios.get( `${baseUrl}/api/call/all-by-status`, null, {
      params: {
          status: ""
      }
  })
      console.log(response)
    } catch (error){
      console.error(error);
  setCalling(true)
}
  }
  const pickCall = () => {
    setCalling(!isCalling);
    setIsActive(!isActive);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    
    try {
      const response = await axios.post(`${baseUrl}/api/payment/initialize-payment`,{},{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response);
    } catch (error) {
      setLoading(false);
      setErrorMessage('Error submitting form. Please try again.');
      return false;
    }finally{
      setPaymentSuccess(true);
    }
  };

  return (
    <div className='mx-auto max-w-screen-2xl px-4 md:px-8'>
      {true &&
      <div 
        onClick={pickCall}
        style={{ cursor: 'pointer' }}
        className={`image ${isActive ? 'active' : ''} ${isCalling ? 'shake bg-green-500' : 'bg-gray-500'} grid item-center justify-center max-w-20 lg:ml-80 mb-2 border rounded py-3`}>
        <img
        src={call}
        alt={'call'}
        className={`image ${isActive ? 'active' : ''}  ${isCalling ? 'shake bg-green-500' : ''} `}
      />
      </div>}
      <div className='flex flex-col overflow-hidden rounded-lg bg-gray-200 sm:flex-row'>
        <div className='flex w-full flex-col p-4 sm:w-1/2 sm:p-8 lg:w-3/5'>
          <h2 className='mb-1 text-xl font-bold text-[#020e7c] md:text-2xl lg:text-4xl'>
            Welcome Back!
          </h2>

          <p className='mb-4 max-w-md text-[#020e7c] font-semibold text-xl text-center items-center justify-center'>
            Doctor A. Buchi
          </p>

          <div className='mt-auto'>
            <a
              href='#'
              className='flex whitespace-nowrap rounded-lg bg-[#020e7c] px-8 py-3 text-center text-sm font-semibold text-gray-100 outline-none ring-indigo-300 transition duration-100 hover:bg-blue-600 focus-visible:ring active:bg-gray-200 md:text-base'
            >
              <span className='mr-4'>Join Meeting Room</span>
              <img src={call} alt='call'/>
            </a>
          </div>
        </div>
        <div className='h-44 w-full bg-gray-300 sm:order-none sm:h-[13rem] sm:w-1/2 lg:w-2/5'>
          <img
            src={DoctorImg}
            loading='lazy'
            alt='Photo by Andras Vas'
            className='h-full w-full object-cover object-center'
          />
        </div>
      </div>
    </div>
  )
}

export default WelcomeBack
