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
  const [showCheckEmail, setShowCheckEmail] = useState(true)
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
          <DoctorSignupForm setCurrentStep={setCurrentStep} />
        )
      case 2:
        return showCheckEmail ? (
                <CheckEmail onAnimationComplete={handleCheckEmailComplete} />
      ) : ( <VerificationInput setCurrentStep={setCurrentStep()} />)
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

  // const handleNextClick = () => {
  //   if (currentStep === 2) {
  //     setCurrentStep(3)
  //   } else if (currentStep === 3) {
  //     navigate('/dashboard/*') // Navigate to the dashboard
  //   }
  // }

  const handleCheckEmailComplete = () => {
    setShowCheckEmail(false)
  }

  const stepLabels = ['Account', 'Verification', 'Login']

  return (
    <div className='min-h-screen min-w-[90vw] flex items-center justify-center bg-gray-50'>
      <div className='w-full bg-white rounded-md mt-5'>
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
