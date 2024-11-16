import React, { useEffect,useState } from 'react'
import messages from "../../assets/mail-add-02.png"
import missedCall from "../../assets/call-missed-02.png"
import axios from 'axios'
import profile from "../../assets/Ícone de perfil de usuário em estilo plano Ilustração em vetor avatar membro em fundo isolado Conceito de negócio de sinal de permissão humana _ Vetor Premium.jpeg"
import {baseUrl} from "../../env.jsx";
const userData = JSON.parse(localStorage.getItem('userData'));
const DoctorProfile = () => {

  const [stats, setStats] = useState({
    appointment: 0,
    totalPatient: 0,
    consultations: 0,
    returnPatient: 0,
  });
  const [missedCalls, setMissedCalls] = useState(0);
  const [message,setMesseges] = useState(0);


   useEffect(() => {
    const id = sessionStorage.getItem("id")
    axios.get( `${baseUrl}/call/${id}/total-patients-consultation`)
      .then(response => {
        const data = response.data;
        console.log("The consultation: ",data)
        const consultations = data.consultations || 0;

        setStats(prevStats => ({
          ...prevStats,
          appointment: data.appointment || 0,
          consultations: consultations,
          returnPatient: data.returnPatient || 0,
          totalPatient: consultations,  
        }));
      })
      .catch(error => {
        console.error('Error fetching consultation and patient data:', error);
      });
  }, []);

  useEffect(() => {
    const id = sessionStorage.getItem("id")
    axios.get(`${baseUrl}/call/missed/count?doctorId=${id}`)
    // axios.get(`${baseUrl}/call/missed/count?doctorId=${id}`)
      .then(response => {
        setMissedCalls(response.data.missedCalls || 0); 
        setMesseges(response.data.message || 0)
      })
      .catch(error => {
        console.error('Error fetching missed calls data:', error);
        console.error('Error fetching messages:', error);
      });
  }, []);
  return (
    <div className='bg-white rounded-3xl shadow-lg p-6  max-w-md mx-auto mt-14'>
      <div className='flex flex-col items-center mb-6'>
      <img 
        src={profile}
        alt='user avatar'
        className='w-40 h-40 rounded-2xl mb-4'
      />
      <span className="font-bold text-[#020E7C] mb-4 max-w-md  text-xl text-center items-center justify-center">
          Doctor  {'  '}
        {userData
         
          ? userData.firstName.charAt(0).toUpperCase() + userData.firstName.slice(1).toLowerCase()
          : ''}
      </span>
      </div>

      <hr className='my-8' />

      <div className='mb-6'>
        <h3 className='text-sm font-semibold text-blue-900 mb-2'>Status</h3>
        <p className='text-xs text-gray-600 mb-1'>Progress</p>
        <div className='w-full bg-gray-200 rounded-full h-2'>
          <div className='bg-blue-900 h-2 rounded-full w-3/4'></div>
        </div>
      </div>

      <hr className='my-8' />

      <div className='grid grid-cols-2 gap-4 mb-6'>
        {[
          { label: 'Appointment', value: stats.appointment },
          { label: 'Total Patient', value: stats.totalPatient },
          { label: 'Consultations', value: stats.consultations },
          { label: 'Return Patient', value: stats.returnPatient }
        ].map((item, index) => (
          <div key={index} className='text-center'>
            <p className='text-2xl font-bold text-blue-900'>{item.value}</p>
            <p className='text-xs text-gray-600'>{item.label}</p>
          </div>
        ))}
      </div>

      <div className='flex justify-between'>
        <button className='bg-blue-900 text-white whitespace-nowrap rounded-lg py-3 px-4 flex flex-col items-center justify-center w-[48%]'>
          <span className='text-2xl font-bold mb-1'>{missedCalls}</span> 
          <span className='text-sm mb-2'>Missed calls</span>
          <img src={missedCall} alt='missed calls' className='w-6 h-6' />
        </button>

        <button className='border border-blue-900 whitespace-nowrap text-blue-900 rounded-lg py-3 px-4 flex flex-col items-center justify-center w-[48%]'>
          <span className='text-2xl font-bold mb-1'>{message}</span>
          <span className='text-sm mb-2'>Messages</span>
          <img src={messages} alt='messages' className='w-6 h-6' />
        </button>
      </div>
   
    </div>
  )
}

export default DoctorProfile
