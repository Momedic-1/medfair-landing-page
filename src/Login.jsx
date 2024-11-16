import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorModal from './components/ErrorModal'
import SpinnerImg from './PatientDashboard/assets/SpinnerSVG.svg';
// import { baseUrl } from './env';
import DesignedSideBar from './components/reuseables/DesignedSideBar';
import eye from "./assets/ph_eye.png";
import close from "./assets/eye-close-svgrepo-com.svg"
import {baseUrl} from "./env.jsx";
import axios from "axios";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible,setIsPasswordVisible] = useState();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handlePasswordVisibility = ()=>{
    setIsPasswordVisible((prevState)=> !prevState)
  }
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
        const id = userData.id
        sessionStorage.setItem("id", id)
        
        // Save token and user data to local storage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData))
        console.log(userData,"userRole")
         if(userData.role === "DOCTOR"){
          navigate('/doctor-dashboard')
         }else if(userData.role === "PATIENT"){
            navigate('/patient-dashboard')
         }else{
          setError('Invalid user role')
         }

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
      

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
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
      <div className="relative">
        <input
          type={isPasswordVisible ? 'text' : 'password'}
          name="password"
          id="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
          className="border rounded-md w-full p-3 text-gray-700"
        />
        <div 
          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
          onClick={handlePasswordVisibility}
        >
        <img
          src={isPasswordVisible ? close : eye }
          className=' w-4'
        />
        </div>
      </div>
    </div>
          <div className="flex items-center justify-between mb-6">

              <p className=' text-sm text-blue-600 cursor-pointer'>Password </p>

            <a href="#" className="text-sm text-blue-600">
             Forgot password?
            </a>
          </div>
                <footer className="flex items-center justify-between mt-4 lg:mt-8">

                    <button
                        type="submit"
                        className={`bg-gradient-to-r from-blue-400 to-purple-600 text-white p-5  w-full h-12 rounded-md flex items-center justify-center   ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >

                        {isLoading ? <img src={SpinnerImg} className=' w-7'/> : 'Login'}
                    </button>
                </footer>
            </form>
        </div>

      <ErrorModal message={error} onClose={handleCloseModal} />
    </div>
  );
}
