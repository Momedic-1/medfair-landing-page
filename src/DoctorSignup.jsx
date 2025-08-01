import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Preline from 'preline'
import DoctorSignupForm from './DoctorSignup/DoctorSignupForm'
import VerificationInput from './DoctorSignup/VerificationInput'
import VerificationSuccessful from './DoctorSignup/VerificationSuccessful'
import CheckEmail from './DoctorSignup/CheckEmail'
import { baseUrl } from './env'
// import DesignedSideBar from './components/reuseables/DesignedSideBar'

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
      navigate('/dashboard') 
    }
  }
 const signUpBackend = async () => {
  setLoading(true);
  try {
    const response = await axios.post(`${baseUrl}/api/v1/registration/doctors-registration`, formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data) {
      setLoading(false);
      return true;
    } else {
      setLoading(false);
      setErrorMessage(response.data.message || 'Form submission failed.');
      return false;
    }
  } catch (error) {
    setLoading(false);
    if (error.response) {

      setErrorMessage(error.response.data.message || 'Form submission failed.');
    } else if (error.request) {

      setErrorMessage('No response received from server.');
    } else {
  
      setErrorMessage('Error submitting form. Please try again.');
    }
    return false;
  }
};

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
    <div className='w-full flex items-center justify-center bg-gray-50'>
     
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
          <div className='mt-5 grid grid-cols-2 justify-between items-center gap-x-2 lg:mx-[12rem] mx-[2rem]'>
            <button
              type='button'
              className='py-2 px-3 inline-flex items-center gap-x-1 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none'
              data-hs-stepper-back-btn
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
              disabled={currentStep === 1}
            >
              Back
            </button>
            <button
              type='button'
              className= {`${currentStep === 2 && 'hidden'} w-[300px] lg:ml-48 md:ml-20 md:w-[720px] py-2 px-3 inline-flex items-center justify-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none`}
              data-hs-stepper-next-btn
              onClick={handleNextClick}
            >
             {currentStep === 3 ? 'Submit' : 'Next'}
            </button>
          </div>
        )}
        <div className='text-center mt-4 mb-12'>
          <a href='#' target="_blank" className='text-blue-500'>
            <p onClick={()=>navigate('/patient_signup')}>Signup as Patient</p>
          </a>
        </div>
      </div>
    </div>
  )
}

export default DoctorSignup

