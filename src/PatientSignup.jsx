import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Preline from 'preline';
import PatientSignupForm from './PatientSignup/PatientSignupForm';
import VerificationInput from './PatientSignup/VerificationInput';
import VerificationSuccessful from './PatientSignup/VerificationSuccessful';
import CheckEmail from './PatientSignup/CheckEmail';
import ErrorModal from './components/ErrorModal';
import { baseUrl } from './env';
import LoadingLoop from "./assets/LoadingLoop.jsx";

const PatientSignup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showCheckEmail, setShowCheckEmail] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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
          <CheckEmail email={'Work on the email props patient'} onAnimationComplete={handleCheckEmailComplete} />
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
    if (currentStep === 1) {
      const formIsValid = await validateForm();
      if (formIsValid) {
        setShowCheckEmail(true);
        setCurrentStep(2);
        console.log("first step");
      }
    } else if (currentStep === 2) {
       await verifyEmail()

    } else if (currentStep === 3) {
      navigate('/login');
    }
  };

  async function verifyEmail(){
    setLoading(true);
    const verificationData = { token: verificationToken, email: formData.emailAddress}
   try {
        const response = await fetch(`${baseUrl}/api/v1/registration/verify-email`, {
          method: 'POST',
          headers: {
           'Content-Type': 'application/json'
          },
          body: JSON.stringify(verificationData),
        });

      const contentType = response.headers.get('Content-Type');
      let result;
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = await response.text();
    }
        if (result.includes('Email verification successful')) {
          setLoading(false)
          setCurrentStep(3);
        } else {
          setLoading(false);
          setErrorMessage('Incorrect token! Please try again.');
          console.error(result.message);
        }
      } catch (error) {
        setLoading(false);
        setErrorMessage('Something went wrong. Try again!');
        console.error('Error verifying email:', error);
      }
  }

  async function validateForm() {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/v1/registration/patients-registrations`, {
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
          console.log(result);
        } catch (error) {
          console.error(error);
          setLoading(false);
          setErrorMessage('Error parsing server response.');
          return false;
        }
      } else {
        console.error('Empty response from the server');
        setLoading(false);
        setErrorMessage('Empty response from the server.');
        return false;
      }

      if (response.ok) {
        setLoading(false);
        console.log(response);
        return true;
      } else {
        console.error(result.message || 'Form submission failed');
        setLoading(false);
        setErrorMessage(result.message || 'Form submission failed.');
        return false;
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setLoading(false);
      setErrorMessage('Error submitting form. Please try again.');
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
            {
                currentStep !== 1 && <button
                    type='button'
                    className='py-2 px-3 inline-flex items-center gap-x-1 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none'
                    data-hs-stepper-back-btn
                    onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                    disabled={currentStep === 1}
                >
                  Back
                </button>
            }
            <button
                type='button'
                className={`${currentStep === 1 && 'w-full md:w-[80%] md:ml-20 grid justify-center'} py-2 px-3 inline-flex items-center gap-x-1 text-sm font-medium rounded-lg border bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 disabled:pointer-events-none`}
                data-hs-stepper-next-btn
                onClick={handleNextClick}
                disabled={loading}
            >
              {loading ? (
                  <>
                    <LoadingLoop/>
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

        {/* Error Modal */}
        <ErrorModal message={errorMessage} onClose={() => setErrorMessage('')} />
      </div>
    </div>
  );
};

export default PatientSignup;
