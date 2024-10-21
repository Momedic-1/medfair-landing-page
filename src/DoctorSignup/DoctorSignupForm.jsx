

import { useNavigate } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import SignUpTop from './SignUpTop.jsx';
import * as yup from 'yup';
import Modal from './Modal';
import { baseUrl } from "../env.jsx";
import Steps from "../Steps.jsx";
import React, {useState} from "react";
import flag from "../assets/Vector.png"

const validationSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  emailAddress: yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  gender: yup.string().oneOf(['Male', 'Female'], 'Invalid gender').required('Gender is required'),
  specialization: yup.string(),
  hospital: yup.string(),

  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmedPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords do not match')
    .required('Confirm password is required'),
  howDidYouHearAboutUs: yup.string(),
  acceptTerms: yup.bool().oneOf([true], 'You must accept the terms and conditions'),
});

const DoctorSignupForm = ({ setCurrentStep }) => {
    const navigate = useNavigate();

  const initialValues = {
    firstName: '',
    lastName: '',
    emailAddress: '',
    phoneNumber: '',
    gender: '', 
    specialization: '',
    hospital: '',
    password: '',
    confirmedPassword: '',
    howDidYouHearAboutUs: '', 
    
    acceptTerms: true, 
    userRole: "DOCTOR",
  };

  const handleSubmit = async (values, { resetForm }) => {
   values.howDidYouHearAboutUs = "NEWSPAPER";
    try {
      const response = await fetch(`https://momedic.onrender.com/api/v1/registration/doctors-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      const responseText = await response.text();
      console.log(response);
      localStorage.setItem('email', JSON.stringify(values.emailAddress));
      navigate('/check-email');
    } catch (error) {
      console.log(error);
    } finally {
      resetForm();
    }
  };
  const stepLabels = ['Account', 'Verification', 'Login']

  return (
    <>
      <SignUpTop />
      <Steps stepLabels={stepLabels} currentStep={1} />
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <Form className="mx-auto px-8  max-w-xl  md:max-w-3xl lg:p-6">
        
            <div className='grid grid-cols-1 md:grid-cols-2 gap-20'>
            <div className='   mt-7'>
              <h1 className='text-gray-600 font-medium text-sm'>First Name</h1>
              <Field
                required
                type='text'
                name='firstName'
                
                placeholder='Enter First Name'
                className='w-[100%] mt-3  max-w-xs sm:max-w-sm md:max-w-full p-4 border border-gray-300 rounded text-sm '
              />
            </div>

            <div className=' mt-7'>
              <h1 className='text-gray-600 font-medium text-sm'>Last Name</h1>
              <Field
                required
                type='text'
                name='lastName'
               
                placeholder='Enter Last Name'
                className='w-[100%] mt-3  max-w-xs sm:max-w-sm md:max-w-full p-4 border border-gray-300 rounded text-sm '
              />
            </div>
          </div>
           
          <div className='grid grid-cols-1 md:grid-cols-2 gap-20'>
  
      <div className=' mt-7'>
       <h1 className='text-gray-600 font-medium text-sm'>Email</h1>
    <Field
      required
      type='email'
      name='emailAddress'
      placeholder='Enter Email'
      className='w-[100%] mt-3  max-w-xs sm:max-w-sm md:max-w-full p-4 border border-gray-300 rounded text-sm  '
    />
  </div>

 
  <div className='flex flex-col  mt-9'>
    <h1 className='text-gray-600 font-medium text-sm'>Mobile Number</h1>
    <div className='flex items-center border border-gray-300 rounded  mt-2'>
      
      <div className='flex items-center px-2'>
        <img src={flag} alt='flag' className='w-12 rounded' />
      </div>
      <span className=' text-gray-600'>+234</span>
     
      <div className='border-2  h-14 mx-2'></div>
      <Field
        required
        type='text'
        name='phoneNumber'
        placeholder='Enter mobile number'
        className='p-4  bg-transparent focus:outline-none'
      />
    </div>
  </div>
</div>



          <h1 className=' mt-9  p-2 text-gray-600 font-medium text-sm'>Sex</h1>
          <div className='flex items-center justify-between w-full mb-6'>
            <div className='flex items-center w-1/2 px-2'>
              <p className='mr-2'>Male</p>
              <Field
                required
                type='radio'
                name='gender'
                value='Male'
                className='rounded-md'
              />
            </div>
            <div className='flex items-center w-1/2 px-10'>
              <p className='mr-2'>Female</p>
              <Field
                required
                type='radio'
                name='gender'
                value='Female'
                className='rounded-md'
              />
            </div>
          </div>
           
           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medical specialization
                </label>
                <Field
                  type="text"
                  name="specialization"
                  className="w-[100%] mt-3  max-w-xs sm:max-w-sm md:max-w-full p-4 border border-gray-300 rounded text-sm "
                  placeholder="Enter here"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name of Hospital you work
                </label>
                <Field
                  type="text"
                  name="hospital"
                  className="w-[100%] mt-3  max-w-xs sm:max-w-sm md:max-w-full p-4 border border-gray-300 rounded text-sm "
                  placeholder="Enter here"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Password <span className="text-red-500">*</span>
                </label>
                <Field
                  type="password"
                  name="password"
                  className="w-[100%] mt-2 max-w-xs sm:max-w-sm md:max-w-full p-4 border border-gray-300 rounded text-sm"
                  placeholder="Password"
                  autoComplete="new-password"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Re-Enter Password <span className="text-red-500">*</span>
                </label>
                <Field
                  type="password"
                  name="confirmedPassword"
                  className="w-[100%] mt-2  max-w-xs sm:max-w-sm md:max-w-full p-4 border border-gray-300 rounded text-sm"
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                />
                <ErrorMessage
                  name="confirmedPassword"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="howDidYouHearAboutUs" className="block text-sm font-medium text-gray-700 mb-1">
                How did you hear about us?
              </label>
              <Field
                as="select"
                name="howDidYouHearAboutUs"
                className="w-[97%] mt-2 lg:w-[100%] p-4 border border-gray-300 rounded text-sm"

              >
                <option value="INSTAGRAM">Instagram</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="X">X</option>
                <option value="NEWSPAPER">Newspaper</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="OTHERS">Others</option>
              </Field>
            </div>

            
            
            <div className="flex gap-7 flex-col md:flex-row  mt-6">
           
            <Modal />
            <a onClick={() => navigate('/login')} className="text-sm font-medium lg:ml-36 md:mr-8">
               Already have an account? <span className="text-[#020E7C] cursor-pointer">Login here</span>
             </a>
           </div>
           <div className="mt-6 flex items-center font-bold  ">
             <Field type="checkbox" name="acceptTerms" className="form-checkbox" />
             <span className="text-sm ml-2 ">
               Accept the{' '}
               <a href="#" className="text-[#020E7C]">
                 Terms and Conditions, of Medfair{' '}
                 
               </a>
             </span>
             <ErrorMessage name="acceptTerms" component="div" className="text-red-500 text-sm" />
           </div>

            <button
              type="submit"
              className={` w-[300px]  mt-5 lg:w-[97%]  md:w-[95%] p-4 py-2 px-3 inline-flex items-center justify-center  text-sm font-semibold rounded-lg border border-transparent bg-[#020E7C] text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none`}
            >
              Next
            </button>
          </Form>
        )}
      </Formik>
      <div className='text-center mt-4 mb-12'>
             <a href='/patient_signup' target="" className='text-blue-500'>
                 <p>Signup as Patient</p>
            </a>
        </div>
    </>
  );
};

export default DoctorSignupForm;
