import React, { useState, useEffect } from 'react'
import HSStepperJS from 'preline/preline'
import * as Preline from 'preline'
import DoctorSignupForm from './DoctorSignup/DoctorSignupForm'
import VerificationInput from './DoctorSignup/VerificationInput'

const DoctorSignup = () => {
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    if (Preline.HSStepperJS && typeof Preline.HSStepperJS.init === 'function') {
      Preline.HSStepperJS.init()
    }
  }, [])

  const renderStepContent = step => {
    switch (step) {
      case 1:
        return (
          <div>
            <DoctorSignupForm />
          </div>
        )
      case 2:
        return (
          <div className=''>
            <VerificationInput />
          </div>
        )
      case 3:
        return <div className='bg-white'>LOGIN</div>
      default:
        return null
    }
  }

  const stepLabels = ['Account', 'Verification', 'Login']

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-gray-50'>
      <div className='w-full p-8 bg-white rounded-md'>
        <h2 className='text-2xl font-bold mb-6 text-center text-violet-950'>
          Doctor Signup
        </h2>
        <p className='text-center mb-8 text-violet-950'>
          Input correct details to signup
        </p>

        <div data-hs-stepper>
          {/* Stepper Nav */}
          <ul className='relative flex justify-center mb-4 ml-4 lg:ml-[14rem] mr-4 lg:mr-[18rem] rounded-md bg-slate-100 p-6'>
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

          {/* Stepper Content */}
          <div className='mt-5 sm:mt-8'>
            {[1, 2, 3].map(step => (
              <div
                key={step}
                data-hs-stepper-content-item={`{"index": ${step}}`}
                style={{ display: currentStep === step ? 'block' : 'none' }}
              >
                {renderStepContent(step)}
              </div>
            ))}
          </div>

          {/* Button Group */}
          <div className='mt-5 flex justify-between items-center gap-x-2 lg:mx-[12rem] mx-[2rem]'>
            <button
              type='button'
              className='py-2 px-3 inline-flex items-center gap-x-1 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none'
              data-hs-stepper-back-btn
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            >
              Back
            </button>
            <button
              type='button'
              className='py-2 px-3 inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none'
              data-hs-stepper-next-btn
              onClick={() => setCurrentStep(prev => Math.min(prev + 1, 3))}
            >
              {currentStep === 3 ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>

        <div className='text-center mt-4'>
          <a href='#' className='text-blue-500'>
            Back to Homepage
          </a>
        </div>
      </div>
    </div>
  )
}

export default DoctorSignup
