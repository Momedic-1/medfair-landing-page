import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Preline from 'preline'
import DoctorSignupForm from './DoctorSignup/DoctorSignupForm'
import VerificationInput from './DoctorSignup/VerificationInput'
import VerificationSuccessful from './DoctorSignup/VerificationSuccessful'
import CheckEmail from './DoctorSignup/CheckEmail'
import { baseUrl } from './env'

const DoctorSignup = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [showCheckEmail, setShowCheckEmail] = useState(false)
  const [formData, setFormData] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    if (Preline.HSStepperJS && typeof Preline.HSStepperJS.init === 'function') {
      Preline.HSStepperJS.init()
    }
  }, [])

  const renderStepContent = step => {
    switch (step) {
      case 1:
        return (
          <DoctorSignupForm formData={formData} setFormData={setFormData} />
        )
      case 2:
        return showCheckEmail ? (
          <CheckEmail onAnimationComplete={handleCheckEmailComplete} />
        ) : (
          <VerificationInput />
        )
      case 3:
        return (
          <div>
            <VerificationSuccessful />
          </div>
        )
      default:
        return null
    }
  }

  const handleNextClick = () => {
    
    if (currentStep === 1) {
      if (validateForm()) {
        setShowCheckEmail(true)
        signUpBackend()
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      setCurrentStep(3)
    } else if (currentStep === 3) {
      navigate('/dashboard') // Navigate to the dashboard
    }
  }
  const signUpBackend = async()=>{
    console.log(formData)
    try {
      const response = await fetch(`https://momedic.onrender.com/api/v1/registration/doctors-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const responseText = await response.text();
      let result = {};

      const responseData = await response.json();
      const token = responseData.message
      const userData = responseData.data

      // Save token and user data to local storage
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData))

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch (error) {
          setLoading(false);
          setErrorMessage('Error parsing server response.');
          return false;
        }
      } else {
        setLoading(false);
        setErrorMessage('Empty response from the server.');
        return false;
      }

      if (response.ok) {
        setLoading(false);
        return true;
      } else {
        setLoading(false);
        setErrorMessage(result.message || 'Form submission failed.');
        return false;
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage('Error submitting form. Please try again.');
      return false;
    }
  }

  const validateForm = () => {
    // Add your form validation logic here
    // Return true if the form is valid, false otherwise
    return true
  }

  const handleCheckEmailComplete = () => {
    setShowCheckEmail(false)
  }

  const stepLabels = ['Account', 'Verification', 'Login']

  return (
    <div className='min-h-screen min-w-[90vw] flex items-center justify-center bg-gray-50'>
      <div className='w-full bg-white rounded-md'>
        <div className='p-8 bg-white rounded-md'>
          <h2 className='text-2xl font-bold mb-6 text-center text-violet-950'>
            Doctor Signup
          </h2>
          <p className='text-center mb-8 text-violet-950'>
            Input correct details to signup
          </p>

          <div data-hs-stepper>
            <ul className='relative flex justify-center items-center mb-4 ml-4 lg:ml-[14rem] mr-4 lg:mr-[18rem] rounded-md bg-slate-100 p-6'>
              {stepLabels.map((label, index) => (
                <li
                  key={index}
                  className='flex items-center gap-x-2 shrink basis-0 flex-1 group'
                  data-hs-stepper-nav-item={`{"index": ${index + 1}}`}
                >
                  <span className='min-w-7 min-h-7 group inline-flex items-center text-xs align-middle'>
                    <span
                      className={`size-7 flex justify-center items-center flex-shrink-0 ${
                        currentStep >= index + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      } font-medium rounded-full`}
                    >
                      {index + 1}
                    </span>
                    <span className='ms-2 text-sm font-medium text-gray-800'>
                      {label}
                    </span>
                  </span>
                  {index < 2 && (
                    <div className='w-full h-px flex-1 bg-gray-200 group-last:hidden'></div>
                  )}
                </li>
              ))}
            </ul>

            <div className='mt-5 sm:mt-8'>{renderStepContent(currentStep)}</div>
          </div>
        </div>

        {!showCheckEmail && (
          <div className='mt-5 justify-between items-center  lg:mx-[12rem] mx-[2rem]'>
            <button
              type='button'
              className= {` ${currentStep === 2 && 'max-w-xs bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition duration-300'} w-[300px] lg:ml-48 md:ml-20 md:w-[720px] py-2 px-3 inline-flex items-center justify-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none`}
              // data-hs-stepper-next-btn
              onClick={handleNextClick}
            >
             {currentStep === 3 ? 'Submit' : currentStep === 2? 'Verify':  'Next'}
            </button>
          </div>
        )}
        <div className='text-center mt-4 mb-12'>
          <a href='/patient_signup' target="_blank" className='text-blue-500'>
            <p>Signup as Patient</p>
          </a>
        </div>
      </div>
    </div>
  )
}

export default DoctorSignup
