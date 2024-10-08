import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Preline from 'preline'
import DoctorSignupForm from './DoctorSignupForm.jsx'
import VerificationInput from './VerificationInput.jsx'
import VerificationSuccessful from './VerificationSuccessful.jsx'
import CheckEmail from './CheckEmail.jsx'
import { baseUrl } from '../env.jsx'
import Steps from "../Steps.jsx";
import SignUpTop from "./SignUpTop.jsx";
import SignUpButton from "./SignUpButton.jsx";

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
          <CheckEmail email={'Work on the email props doctor'} onAnimationComplete={handleCheckEmailComplete} />
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
        // navigate('/check-mail')
      }
    } else if (currentStep === 2) {
      setCurrentStep(3)
    } else if (currentStep === 3) {
      navigate('/dashboard/*') // Navigate to the dashboard
    }
  }
  const signUpBackend = async()=>{
    try {
      const response = await fetch(`${baseUrl}/api/v1/registration/doctors-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const responseText = await response.text();
      console.log(response)
      // let result = {};

      if (responseText) {
        try {
          // result = JSON.parse(responseText);
        } catch (error) {
          // setLoading(false);
          // setErrorMessage('Error parsing server response.');
          return false;
        }
      } else {
        // setLoading(false);
        // setErrorMessage('Empty response from the server.');
        return false;
      }

      if (response.ok) {
        // setLoading(false);
        return true;
      } else {
        // setLoading(false);
        // setErrorMessage(result.message || 'Form submission failed.');
        return false;
      }
    } catch (error) {
      // setLoading(false);
      // setErrorMessage('Error submitting form. Please try again.');
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
           <SignUpTop/>


            <Steps stepLabels={stepLabels} currentStep={currentStep} />
            <div className='mt-5 sm:mt-8'>{renderStepContent(currentStep)}</div>
        </div>

        <SignUpButton handleNextClick={handleNextClick} currentStep={currentStep} showCheckEmail={showCheckEmail} />
      </div>
    </div>
  )
}

export default DoctorSignup
