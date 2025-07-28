import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {login, setError} from './features/authSlice';
import ErrorModal from './components/ErrorModal';
import SpinnerImg from './PatientDashboard/assets/SpinnerSVG.svg';
import DesignedSideBar from './components/reuseables/DesignedSideBar';
import eye from "./assets/ph_eye.png";
import close from "./assets/eye-close-svgrepo-com.svg";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { baseUrl } from './env'
import { getToken } from '../src/utils';



export default function LoginPage() {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, isLoading, userData } = useSelector((state) => state.auth);
  const token = getToken();

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
    dispatch(login(formData));
  };

  const handleCloseModal = () => {
    dispatch(setError ('')) ;
  };

  const fetchDoctorProfile = async () => {
    const response = await axios.get(`${baseUrl}/api/v1/doctor-profile/profile-info`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    localStorage.setItem('doctorProfile', JSON.stringify(response.data));
  }

  // const goToLogin = ()=> {
  //   navigate('/signup');
  // }

  useEffect(() => {
    if (userData) {
      console.log(userData);
      const role = userData.role;
      if (role === "DOCTOR") {
        navigate('/doctor-dashboard');
        fetchDoctorProfile();
      } else if (role === "PATIENT") {
        navigate('/patient-dashboard');
      } else {
        setError('Invalid user role');
      }
    }
  }, [userData, navigate]);

  useEffect(() => {
    // Clear form data and show success message if coming from password reset
    if (location.state?.successMessage) {
      setFormData({
        emailOrPhone: '',
        password: '',
      });
      toast.success(location.state.successMessage);
    }
  }, [location]);

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <DesignedSideBar />
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
        <h1 className="text-2xl mb-8 text-blue-500 mt-12 lg:mt-0">Get Started</h1>
        <form onSubmit={handleSubmit} className="p-0 md:p-8 w-3/4 max-w-md">
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <div className="lg:mb-10 mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="emailOrPhone">
          Email / PhoneNumber
        </label>
        <input
          type="text"
          name="emailOrPhone"
          id="emailOrPhone"
          placeholder="Enter your email or phone number"
          value={formData.emailOrPhone}
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
                <img src={isPasswordVisible ? close : eye} className="w-4" alt="Toggle visibility" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mb-6">
            <a href="/forgot-password" className="text-sm text-blue-600">
              Forgot password?
            </a>
          </div>
          <div className="flex items-center justify-between mt-4 lg:mt-8">
            <button
              type="submit"
              className={`bg-gradient-to-r from-blue-400 to-purple-600 text-white p-5 w-full h-12 rounded-md flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? <img src={SpinnerImg} className="w-7" alt="Loading" /> : 'Login'}
            </button>
            
          </div>
          {/* <button className="text-blue-500 text-sm font-medium mt-2" onClick={goToLogin}>Don't have an account?</button> */}
        </form>
      </div>

      <ErrorModal message={error} onClose={handleCloseModal} />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
