import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentImage from './PatientDashboard/assets/payment.svg';
import axios from 'axios';
import {baseUrl} from "./env.jsx";

const VerifyPayment = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference');
    
    if (reference) {
    
      console.log('Payment Reference:', reference);

      verifyPayment(reference);
    } else {
      console.error('No reference found.');
    }
  }, []);

  const verifyPayment = async (reference) => {
    try {
      const response = await axios.get(`${baseUrl}/api/payment/verify/${reference}`)
      setMessage(response.data)
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen items-center justify-center bg-gray-100">
      <h1 className="mt-5 lg:mt-0 text-2xl text-black mb-3 text-center">Payment Verification</h1>
      <div className="bg-white p-6 border border-gray-300 shadow-lg rounded-md w-full max-w-md text-center">
        <img src={paymentImage} alt="Payment Success" className="h-32 w-32 mx-auto mb-4" />
        <div>{message}</div>
    </div>
      <div className="mt-6 w-full max-w-xs">
        <button
          onClick={() => navigate('/patient-dashboard')}
          className="bg-gradient-to-r from-blue-400 to-purple-600 text-white p-3 rounded-md w-full shadow hover:opacity-90 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default VerifyPayment;
