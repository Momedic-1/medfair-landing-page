import person from '../src/assets/person.svg';
import medfair from '../src/assets/medfair (2).svg';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorModal from '../src/components/ErrorModal'
import SpinnerImg from './PatientDashboard/assets/SpinnerSVG.svg';
import { baseUrl } from './env';
import DesignedSideBar from './components/reuseables/DesignedSideBar';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'An error occurred. Please try again.');
      } else {
        const responseData = await response.json();
        const token = responseData.message
        const userData = responseData.data

        // Save token and user data to local storage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData))


          navigate('/patient-dashboard')
      }
    } catch (err) {
      setError('Something went wrong, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = ()=>{
    setError('')
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Top Banner for Mobile */}
      <DesignedSideBar/>

      {/* Left Side - Design and Background */}
      <div className="w-full lg:w-2/5 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center hidden lg:flex">
        <div className="text-white text-center p-6">
          <img src={person} className="h-60 w-60" alt="Person" />
          <div className="flex flex-col justify-center items-center">
            <img src={medfair} alt="Design Icon" className="h-20 w-20" />
            <p className="text-center text-xl">MEDFAIR</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
        <h1 className="text-2xl mb-3 text-blue-500 mt-5 lg:mt-0">Get Started</h1>
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
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="border rounded-md w-full p-3 text-gray-700"
            />
          </div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <input type="checkbox" id="rememberMe" className="mr-2" />
              <label htmlFor="rememberMe" className="text-sm text-gray-600">
                {/* Remember me */}
              </label>
            </div>
            <a href="#" className="text-sm text-blue-600">
              Forgot password?
            </a>
          </div>

          <footer className="flex items-center justify-between mt-4 lg:mt-8">
            <p className="text-sm text-blue-600 m-3">By continuing, you agree to the TERMS & CONDITIONS</p>
            <button
              type="submit"
              className={`bg-gradient-to-r from-blue-400 to-purple-600 text-white p-3 m-3 rounded-full flex items-center justify-center w-10 h-10 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
                
              {isLoading ?<img src={SpinnerImg}/>  : '>'}
            </button>
          </footer>
        </form>
      </div>

      <ErrorModal message={error} onClose={handleCloseModal} />
    </div>
  );
}
