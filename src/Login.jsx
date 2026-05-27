// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useLocation } from "react-router-dom";
// import { login, setError } from "./features/authSlice";
// import ErrorModal from "./components/ErrorModal";
// import SpinnerImg from "./PatientDashboard/assets/SpinnerSVG.svg";
// import DesignedSideBar from "./components/reuseables/DesignedSideBar";
// import eye from "./assets/ph_eye.png";
// import close from "./assets/eye-close-svgrepo-com.svg";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import axios from "axios";
// import { baseUrl } from "./env";
// import { getToken } from "../src/utils";

// export default function LoginPage() {
//   const [formData, setFormData] = useState({
//     emailOrPhone: "",
//     password: "",
//   });
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { error, isLoading, userData } = useSelector((state) => state.auth);
//   const token = getToken();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const handlePasswordVisibility = () => {
//     setIsPasswordVisible((prevState) => !prevState);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     dispatch(login(formData));
//   };

//   const handleCloseModal = () => {
//     dispatch(setError(""));
//   };

//   const fetchDoctorProfile = async () => {
//     const response = await axios.get(
//       `${baseUrl}/api/v1/doctor-profile/profile-info`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     localStorage.setItem("doctorProfile", JSON.stringify(response.data));
//   };

//   // const goToLogin = ()=> {
//   //   navigate('/signup');
//   // }

//   useEffect(() => {
//     if (userData) {
//       console.log(userData);
//       const role = userData.role;
//       if (role === "DOCTOR") {
//         navigate("/doctor-dashboard");
//         fetchDoctorProfile();
//       } else if (role === "PATIENT") {
//         navigate("/patient-dashboard");
//       } else {
//         setError("Invalid user role");
//       }
//     }
//   }, [userData, navigate]);

//   useEffect(() => {
//     // Clear form data and show success message if coming from password reset
//     if (location.state?.successMessage) {
//       setFormData({
//         emailOrPhone: "",
//         password: "",
//       });
//       toast.success(location.state.successMessage);
//     }
//   }, [location]);

//   return (
//     <div className="flex flex-col lg:flex-row h-screen">
//       <DesignedSideBar />
//       <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
//         <h1 className="text-2xl mb-8 text-blue-500 mt-12 lg:mt-0">
//           Get Started
//         </h1>
//         <form onSubmit={handleSubmit} className="p-0 md:p-8 w-3/4 max-w-md">
//           {error && <p className="text-red-600 mb-4">{error}</p>}
//           <div className="lg:mb-10 mb-4">
//             <label
//               className="block text-gray-700 text-sm font-bold mb-2"
//               htmlFor="emailOrPhone"
//             >
//               Email / PhoneNumber
//             </label>
//             <input
//               type="text"
//               name="emailOrPhone"
//               id="emailOrPhone"
//               placeholder="Enter your email or phone number"
//               value={formData.emailOrPhone}
//               onChange={handleChange}
//               required
//               className="border rounded-md w-full p-3 text-gray-700"
//             />
//           </div>

//           <div className="mb-4 lg:mt-8">
//             <label
//               className="block text-gray-700 text-sm font-bold mb-2"
//               htmlFor="password"
//             >
//               Password
//             </label>
//             <div className="relative">
//               <input
//                 type={isPasswordVisible ? "text" : "password"}
//                 name="password"
//                 id="password"
//                 placeholder="Enter your password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//                 className="border rounded-md w-full p-3 text-gray-700"
//               />
//               <div
//                 className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
//                 onClick={handlePasswordVisibility}
//               >
//                 <img
//                   src={isPasswordVisible ? close : eye}
//                   className="w-4"
//                   alt="Toggle visibility"
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center justify-between mb-6">
//             <a href="/forgot-password" className="text-sm text-blue-600">
//               Forgot password?
//             </a>
//           </div>
//           <div className="flex items-center justify-between mt-4 lg:mt-8">
//             <button
//               type="submit"
//               className={`bg-gradient-to-r from-blue-400 to-purple-600 text-white p-5 w-full h-12 rounded-md flex items-center justify-center ${
//                 isLoading ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <img src={SpinnerImg} className="w-7" alt="Loading" />
//               ) : (
//                 "Login"
//               )}
//             </button>
//           </div>
//           {/* <button className="text-blue-500 text-sm font-medium mt-2" onClick={goToLogin}>Don't have an account?</button> */}
//         </form>
//       </div>

//       <ErrorModal message={error} onClose={handleCloseModal} />
//       <ToastContainer position="top-right" autoClose={3000} />
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { login, setError } from "./features/authSlice";
import ErrorModal from "./components/ErrorModal";
import DesignedSideBar from "./components/reuseables/DesignedSideBar";
import eye from "./assets/ph_eye.png";
import close from "./assets/eye-close-svgrepo-com.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { baseUrl } from "./env";
import { getToken } from "../src/utils";

export default function LoginPage({ isPartnerLogin = false }) {
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
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
    dispatch(setError(""));
  };

  const fetchDoctorProfile = async () => {
    const response = await axios.get(
      `${baseUrl}/api/v1/doctor-profile/profile-info`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    localStorage.setItem("doctorProfile", JSON.stringify(response.data));
  };

  // const goToLogin = ()=> {
  //   navigate('/signup');
  // }

  // useEffect(() => {
  //   if (userData) {
  //     console.log(userData);
  //     const role = userData.role;
  //     if (role === "DOCTOR") {
  //       navigate("/doctor-dashboard");
  //       fetchDoctorProfile();
  //     } else if (role === "PATIENT") {
  //       navigate("/patient-dashboard");
  //     } else {
  //       setError("Invalid user role");
  //     }
  //   }
  // }, [userData, navigate]);

  useEffect(() => {
    if (userData) {
      const role = userData.role;

      if (role === "DOCTOR") {
        fetchDoctorProfile();
        navigate("/doctor-dashboard");
      } else if (role === "PATIENT") {
        if (isPartnerLogin) {
          navigate("/patient-dashboard/partners");
        } else {
          navigate("/patient-dashboard");
        }
      } else {
        dispatch(setError("Invalid user role"));
      }
    }
  }, [userData, navigate, isPartnerLogin]);

  useEffect(() => {
    // Clear form data and show success message if coming from password reset
    if (location.state?.successMessage) {
      setFormData({
        emailOrPhone: "",
        password: "",
      });
      toast.success(location.state.successMessage);
    }
  }, [location]);

  const inputClass =
    "block w-full h-11 rounded-xl border border-gray-200 bg-gray-50/80 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#020e7c] focus:bg-white focus:ring-2 focus:ring-[#020e7c]/15";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5";

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <DesignedSideBar className="hidden lg:block" />
      <div className="flex w-full flex-1 flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-blue-50/40 px-4 py-8 sm:px-6 sm:py-10 lg:w-2/3">
        <div className="w-full max-w-md">
          <div className="mb-6 rounded-2xl border border-blue-100 bg-white/80 p-4 text-center shadow-sm backdrop-blur lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#020e7c]/70">
              Medfair
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Secure telemedicine access on any device.
            </p>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#020e7c]/70">
              {isPartnerLogin ? "Partner access" : "Welcome back"}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#020e7c] sm:text-3xl">
              Sign in to Medfair
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {isPartnerLogin
                ? "Log in with your partner account credentials."
                : "Book doctors, join video visits, and manage your care."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8"
          >
            {error && (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mb-5">
              <label className={labelClass} htmlFor="emailOrPhone">
                Email or phone
              </label>
              <input
                type="text"
                name="emailOrPhone"
                id="emailOrPhone"
                placeholder="you@email.com or +234…"
                value={formData.emailOrPhone}
                onChange={handleChange}
                required
                autoComplete="username"
                className={inputClass}
              />
            </div>

            <div className="mb-2">
              <label className={labelClass} htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-[#020e7c]"
                  onClick={handlePasswordVisibility}
                  aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                >
                  <img
                    src={isPasswordVisible ? close : eye}
                    className="h-4 w-4"
                    alt=""
                  />
                </button>
              </div>
            </div>

            <div className="mb-6 flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-[#020e7c] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#020e7c] text-sm font-semibold text-white shadow-md transition hover:bg-[#0a1a8f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Need an account?{" "}
            <Link to="/patient_signup" className="font-medium text-[#020e7c] hover:underline">
              Patient signup
            </Link>
            {" · "}
            <Link to="/doctor_signup" className="font-medium text-[#020e7c] hover:underline">
              Doctor signup
            </Link>
          </p>
        </div>
      </div>

      <ErrorModal message={error} onClose={handleCloseModal} />
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
