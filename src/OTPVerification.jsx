import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ErrorModal from './components/ErrorModal';
import SpinnerImg from './PatientDashboard/assets/SpinnerSVG.svg';
import DesignedSideBar from './components/reuseables/DesignedSideBar';
import { baseUrl } from './env';

export default function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from location state
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // If no email in state, redirect back to forgot password
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if current input is filled
    if (value && index < 4) {
      inputRefs.current[index + 1].focus();
    }

    // If all inputs are filled, submit automatically
    if (newOtp.every(digit => digit == 4)) {
      handleSubmit();
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = otp.join('');
      const response = await fetch(`${baseUrl}/api/v1/registration/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email
        }),
      });

      const responseText = await response.text();
      
      if (responseText.includes('Email verification successful')) {
        // After successful verification, make the password reset request
        const resetResponse = await fetch(`${baseUrl}/api/v1/registration/password/reset`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            newPassword: location.state.newPassword
          }),
        });

        if (resetResponse.ok) {
          navigate('/login', { state: { successMessage: 'Password Reset Successful' } });
        } else {
          const resetData = await resetResponse.json();
          setError(resetData.message || 'Failed to reset password');
        }
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while verifying OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setError('');
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <DesignedSideBar />
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
        <h1 className="text-2xl mb-3 text-blue-500 mt-5 lg:mt-0">Enter Verification Code</h1>
        <div className="p-0 md:p-8 w-3/4 max-w-md">
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <p className="text-gray-600 mb-6 text-center">
            We've sent a verification code to {email}
          </p>
          
          <div className="flex justify-center space-x-2 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || otp.some(digit => digit === '')}
            className={`bg-gradient-to-r from-blue-400 to-purple-600 text-white p-5 w-full h-12 rounded-md flex items-center justify-center ${
              isLoading || otp.some(digit => digit === '') ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? <img src={SpinnerImg} className="w-7" alt="Loading" /> : 'Verify'}
          </button>

          <p className="text-center mt-4 text-sm text-gray-600">
            Didn't receive the code?{' '}
            <button 
              className="text-blue-600 hover:underline"
              onClick={() => {
                // TODO: Implement resend OTP functionality
              }}
            >
              Resend
            </button>
          </p>
        </div>
      </div>

      {error && <ErrorModal message={error} onClose={handleCloseModal} />}
    </div>
  );
} 