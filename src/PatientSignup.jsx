import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Preline from 'preline';
import PatientSignupForm from './PatientSignup/PatientSignupForm';
import VerificationInput from './PatientSignup/VerificationInput';
import VerificationSuccessful from './PatientSignup/VerificationSuccessful';
import CheckEmail from './PatientSignup/CheckEmail';

const PatientSignup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showCheckEmail, setShowCheckEmail] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (Preline.HSStepperJS && typeof Preline.HSStepperJS.init === 'function') {
      Preline.HSStepperJS.init();
    }
  }, []);

  const renderStepContent = step => {
    switch (step) {
      case 1:
        return (
          <PatientSignupForm formData={formData} setFormData={setFormData} />
        );
      case 2:
        return showCheckEmail ? (
          <CheckEmail onAnimationComplete={handleCheckEmailComplete} />
        ) : (
          <VerificationInput setVerificationToken={setVerificationToken} />
        );
      case 3:
        return (
          <div>
            <VerificationSuccessful />
          </div>
        );
      default:
        return null;
    }
  };

  const handleNextClick = async () => {
    setLoading(true);
    if (currentStep === 1) {
      const formIsValid = await validateForm();
      if (formIsValid) {
        setShowCheckEmail(true);
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      try {
        const response = await fetch('https://momedic.onrender.com/api/v1/registration/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: verificationToken, email: formData.emailAddress }),
        });

        const result = await response.json();

        if (response.ok) {
          setCurrentStep(3);
        } else {
          setLoading(false)
          alert('Incorrect token!');
          console.error(result.message);
        }
      } catch (error) {
         console.log({ token: verificationToken, email: formData.emailAddress })
        setLoading(false)
        alert('Something went wrong. Try again!');
        console.error('Error verifying email:', error);
      }
    } else if (currentStep === 3) {
      navigate('/login');
    }
  };

  async function validateForm() {
    try {
      console.log(formData);
      const response = await fetch('https://momedic.onrender.com/api/v1/registration/patients-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const responseText = await response.text();
      let result = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText);
          console.log(result)
        } catch (error) {
          console.error(error);
          setLoading(false);
          return false;
        }
      } else {
        console.error('Empty response from the server');
        setLoading(false);
        return false;
      }

      if (response.ok) {
        setLoading(false);
        console.log(response)
        return true;
      } else {
        console.error(result.message || 'Form submission failed');
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setLoading(false);
      return false;
    }
  }

  const handleCheckEmailComplete = () => {
    setShowCheckEmail(false);
  };

  const stepLabels = ['Account', 'Verification', 'Login'];

  return (
    <div className='min-h-screen min-w-[90vw] flex items-center justify-center bg-gray-50'>
      <div className='w-full bg-white rounded-md'>
        <div className='p-8 bg-white rounded-md'>
          <h2 className='text-2xl font-bold mb-6 text-center text-violet-950'>
            Patient Signup
          </h2>
          <p className='text-center mb-8 text-violet-950'>
            Input correct details to signup
          </p>

          <div data-hs-stepper>
            <ul className='flex justify-center mb-4 lg:ml-[14rem] mr-4 lg:mr-[18rem] rounded-md bg-slate-100 p-6'>
              {stepLabels.map((label, index) => (
                <li
                  key={index}
                  className='flex items-center gap-x-2 shrink basis-0 flex-1 group'
                  data-hs-stepper-nav-item={`{"index": ${index + 1}}`}
                >
                  <span className='w-7 h-7 group inline-flex items-center text-xs align-middle'>
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
          <div className='mt-5 flex justify-between items-center gap-x-2 lg:mx-[12rem] mx-[2rem]'>
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
              className='py-2 px-3 inline-flex items-center gap-x-1 text-sm font-medium rounded-lg border bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:pointer-events-none'
              data-hs-stepper-next-btn
              onClick={handleNextClick}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className='animate-spin w-4 h-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                    ></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {currentStep === 3 ? 'Finish' : 'Next'}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSignup;
