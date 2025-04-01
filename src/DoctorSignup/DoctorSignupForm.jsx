


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpTop from './SignUpTop.jsx';
 import Steps from "../Steps.jsx";
import PhoneInput from 'react-phone-input-2';
import Modal from './Modal';
import 'react-phone-input-2/lib/style.css';
import { baseUrl } from '../env.jsx';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { ColorRing } from 'react-loader-spinner';

const specialization = ["Select specialization",'GENERAL_PRACTITIONER', 'PSYCHIATRIST', 'CLINICAL_PSYCHOLOGIST', 'THERAPIST', 'SEX_THERAPIST']
export default function DoctorSignupForm() {

  const formatSpecialization = (specialization) => {
  return specialization
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    phoneNumber: '',
    gender: '',
    medicalSpecialization: '',
    hospital: '',
    password: '',
    confirmedPassword: '',
    howDidYouHearAboutUs: 'NEWSPAPER',
    // acceptTerms: false,
    userRole: 'DOCTOR',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'password' || name === 'confirmedPassword') {
      if (formData.password !== value && name === 'confirmedPassword') {
        setError('Passwords do not match');
      } else if (formData.confirmedPassword !== value && name === 'password') {
        setError('Passwords do not match');
      } else {
        setError('');
      }
    }
  };

  const handlePhoneChange = (phone) => {
    setFormData({
      ...formData,
      phoneNumber: phone,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (formData.password !== formData.confirmedPassword) {
      setError('Passwords do not match');
      return;
    }

    // if (!formData.acceptTerms) {
    //   setError('You must accept the terms and conditions');
    //   return;
    // }

 try {
    const response = await axios.post(`${baseUrl}/api/v1/registration/doctors-registration`, formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    toast.success(response.data.message);

    localStorage.setItem('email', JSON.stringify(formData.emailAddress));
    setLoading(false);
    navigate('/check-email');

  } catch (error) {
    setLoading(false);
    let exceptionMessage = "";
    if (error.response) {
      exceptionMessage = error.response.data.exceptionMessage;
      toast.error(exceptionMessage);
    }

    console.error('Registration failed:', exceptionMessage);
  }
  };
    const stepLabels = ['Account', 'Verification', 'Login']
  return (
    <>
      <ToastContainer />
      <SignUpTop />
       <Steps stepLabels={stepLabels} currentStep={1} />
    <form onSubmit={handleSubmit} className="mx-auto px-6 lg:px-10 md:w-5/6 lg:w-3/6 lg:p-4 md:border md:border-gray-950/20 md:rounded-xl">
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-20'>
        <div className='mt-4'>
          <h1 className='text-gray-600 font-medium text-sm'>First Name</h1>
          <input
            type='text'
            name='firstName'
            value={formData.firstName}
            onChange={handleChange}
            placeholder='Enter First Name'
            className='w-full mt-2 p-4 border border-gray-300 rounded text-sm'
            required
          />
        </div>
        <div className='mt-4'>
          <h1 className='text-gray-600 font-medium text-sm'>Last Name</h1>
          <input
            type='text'
            name='lastName'
            value={formData.lastName}
            onChange={handleChange}
            placeholder='Enter Last Name'
            className='w-full mt-2 p-4 border border-gray-300 rounded text-sm'
            required
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-20'>
        <div className='mt-4'>
          <h1 className='text-gray-600 font-medium text-sm'>Email</h1>
          <input
            type='email'
            name='emailAddress'
            value={formData.emailAddress}
            onChange={handleChange}
            placeholder='Enter Email'
            className='w-full mt-2 p-4 border border-gray-300 rounded text-sm'
            required
          />
        </div>
        <div className='mt-4'>
          <h1 className='text-gray-600 font-medium text-sm'>Mobile Number</h1>
          <PhoneInput
            country={'ng'}
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            inputStyle={{ width: '100%', height: '53px' }}
            containerStyle={{ width: '100%' }}
          />
        </div>
      </div>

      <h1 className='mt-2 text-gray-600 font-medium text-sm ml-2'>Gender</h1>
      <div className='flex flex-col md:flex-row items-center justify-between w-full mb-4'>
        <div className='flex items-center w-full md:w-1/2 px-2 mb-4 md:mb-0'>
          <p className='mr-2'>Male</p>
          <input
            type='radio'
            name='gender'
            value='MALE'
            checked={formData.gender === 'MALE'}
            onChange={handleChange}
            required
          />
        </div>
        <div className='flex items-center w-full md:w-1/2 px-10 mr-16 lg:mr-0'>
          <p className='mr-2'>Female</p>
          <input
            type='radio'
            name='gender'
            value='FEMALE'
            checked={formData.gender === 'FEMALE'}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-20'>
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Medical specialization</label>
          <select
            type='text'
            name='medicalSpecialization'
            value={formData.medicalSpecialization}
            onChange={handleChange}
            className='w-full mt-2 p-4 border border-gray-300 rounded text-sm'
            placeholder='Enter here'
          >
           {
                specialization.map((specialization, index) => (
                  <option key={index} value={specialization} className='w-full border-none outline-none cursor-pointer'>{formatSpecialization(specialization)}</option>
                ))
           }
           
            </select>
        </div>
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Name of Hospital</label>
          <input
            type='text'
            name='hospital'
            value={formData.hospital}
            onChange={handleChange}
            className='w-full mt-2 p-4 border border-gray-300 rounded text-sm'
            placeholder='Enter here'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-20'>
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Password</label>
          <input
            type='password'
            name='password'
            value={formData.password}
            onChange={handleChange}
            className='w-full mt-2 p-4 border border-gray-300 rounded text-sm'
            placeholder='Password'
            required
          />
        </div>
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Confirm Password</label>
          <input
            type='password'
            name='confirmedPassword'
            value={formData.confirmedPassword}
            onChange={handleChange}
            className='w-full mt-2 p-4 border border-gray-300 rounded text-sm'
            placeholder='Confirm Password'
            required
          />
          {error && <p className='text-red-500 text-sm'>{error}</p>}
        </div>
      </div>

      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700 mb-1'>How did you hear about us?</label>
        <select
          name='howDidYouHearAboutUs'
          value={formData.howDidYouHearAboutUs}
          onChange={handleChange}
          className='w-full mt-2 p-4 border border-gray-300 rounded text-sm'
        >
          <option value='INSTAGRAM'>Instagram</option>
          <option value='FACEBOOK'>Facebook</option>
          <option value='X'>X</option>
          <option value='NEWSPAPER'>Newspaper</option>
          <option value='LINKEDIN'>LinkedIn</option>
          <option value='OTHERS'>Others</option>
        </select>
      </div>
      <div className='flex space-x-10 flex-col md:flex-row mt-4'>
     <Modal />
     <a onClick={() => navigate('/login')} className='text-sm font-medium'>
       Already have an account? <span className='text-[#020E7C] cursor-pointer'>Login here</span>
     </a>
      </div>
      {/* <div className='mt-4 flex items-center font-bold'>
        <input
          type='checkbox'
          name='acceptTerms'
          checked={formData.acceptTerms}
          onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
          className='form-checkbox'
        />
        <span className='text-sm ml-2'>
          Accept the{' '}
          <a href='#' className='text-[#020E7C]'>
            Terms and Conditions of Medfair{' '}
          </a>
        </span>
        {error && !formData.acceptTerms && <p className='text-red-500 text-sm'>{error}</p>}
      </div> */}

      <button
        type='submit'
        className='w-[300px] mt-4 lg:w-[97%] md:w-[95%] p-4 py-2 px-3 inline-flex items-center justify-center text-sm font-semibold rounded-lg border border-transparent bg-[#020E7C] text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none'
      >
        {
          loading ? (
            <ColorRing color='#fff' height={20} width={20} />) : (
              "Next")
        }
      </button>
    </form>
    <div className='text-center mt-4 mb-12'>
              <a href='/patient_signup' target="" className='text-blue-500'>
                  <p>Signup as Patient</p>
             </a>
        </div>
    </>
  );
}
