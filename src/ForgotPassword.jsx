import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorModal from './components/ErrorModal';
import SpinnerImg from './PatientDashboard/assets/SpinnerSVG.svg';
import DesignedSideBar from './components/reuseables/DesignedSideBar';
import eye from "./assets/ph_eye.png";
import close from "./assets/eye-close-svgrepo-com.svg";
import { baseUrl } from './env';

export default function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${baseUrl}/api/v1/registration/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/otp-verification', { 
          state: { 
            email: formData.email,
            newPassword: formData.newPassword 
          } 
        });
      } else {
        setError(data.message || 'Failed to initiate password reset');
      }
    } catch (error) {
      setError('An error occurred while initiating password reset');
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
        <h1 className="text-2xl mb-3 text-blue-500 mt-5 lg:mt-0">Reset Password</h1>
        <form onSubmit={handleSubmit} className="p-8 w-3/4 max-w-md">
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <div className="lg:mb-10 mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border rounded-md w-full p-3 text-gray-700"
            />
          </div>

          <div className="mb-4 lg:mt-8">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
              New Password
            </label>
            <div className="relative">
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                name="newPassword"
                id="newPassword"
                placeholder="Enter your new password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="border rounded-md w-full p-3 text-gray-700"
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={handlePasswordVisibility}
              >
                <img src={isPasswordVisible ? close : eye} className="w-4" alt="Toggle visibility" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 lg:mt-8">
            <button
              type="submit"
              className={`bg-gradient-to-r from-blue-400 to-purple-600 text-white p-5 w-full h-12 rounded-md flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? <img src={SpinnerImg} className="w-7" alt="Loading" /> : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>

      <ErrorModal message={error} onClose={handleCloseModal} />
    </div>
  );
} 