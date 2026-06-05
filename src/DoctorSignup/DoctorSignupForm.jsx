import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignUpTop from "./SignUpTop.jsx";
import Steps from "../Steps.jsx";
import PhoneInput from "react-phone-input-2";
import Modal from "./Modal";
import "react-phone-input-2/lib/style.css";
import { baseUrl } from "../env.jsx";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { ColorRing } from "react-loader-spinner";
import { Eye, EyeOff } from "lucide-react";
import SignupRoleSelect from "../components/signup/SignupRoleSelect";

const specialization = [
  "Select specialization",
  "GENERAL_PRACTITIONER",
  "MENTAL_HEALTH_SPECIALIST",
  "CLINICAL_PSYCHOLOGIST",
  "RELATIONSHIP_THERAPIST",
  "UROLOGIST",
  "EAR_NOSE_THROAT_SPECIALIST",
];
export default function DoctorSignupForm() {
  const formatSpecialization = (specialization) => {
    return specialization
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    phoneNumber: "",
    gender: "",
    medicalSpecialization: "",
    hospital: "",
    password: "",
    confirmedPassword: "",
    howDidYouHearAboutUs: "NEWSPAPER",
    // acceptTerms: false,
    userRole: "DOCTOR",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const nextFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(nextFormData);

    if (name === "password" || name === "confirmedPassword") {
      const password = name === "password" ? value : nextFormData.password;
      const confirmed =
        name === "confirmedPassword" ? value : nextFormData.confirmedPassword;
      if (password && password.length < 8) {
        setError("Password must be at least 8 characters");
      } else if (password !== confirmed && password && confirmed) {
        setError("Passwords do not match");
      } else {
        setError("");
      }
    }
  };

  const handlePhoneChange = (phone) => {
    setFormData({
      ...formData,
      phoneNumber: phone,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (formData.password !== formData.confirmedPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    // if (!formData.acceptTerms) {
    //   setError('You must accept the terms and conditions');
    //   return;
    // }

    try {
      const response = await axios.post(
        `${baseUrl}/api/v1/registration/doctors-registration`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      toast.success(response.data.message);

      localStorage.setItem("email", JSON.stringify(formData.emailAddress));
      setLoading(false);
      navigate("/check-email");
    } catch (error) {
      setLoading(false);
      let exceptionMessage = "";
      if (error.response) {
        exceptionMessage = error.response.data.exceptionMessage;
        toast.error(exceptionMessage);
      }

      console.error("Registration failed:", exceptionMessage);
    }
  };
  const stepLabels = ["Account", "Verification", "Login"];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-10">
      <ToastContainer />
      <SignUpTop />
      <Steps stepLabels={stepLabels} currentStep={1} />
      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-4 w-[95%] max-w-4xl rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:p-6 md:w-5/6 lg:w-3/5 lg:p-8"
      >
        <div className="mb-5 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">Doctor Registration</h2>
          <p className="mt-1 text-sm text-slate-500">
            Complete your account details to continue to verification.
          </p>
        </div>

        <SignupRoleSelect
          value="DOCTOR"
          fieldClass="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-medium text-[#020E7C] focus:border-[#020E7C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#020E7C]/15"
          className="mb-6 max-w-md"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-20">
          <div className="mt-4">
            <h1 className="text-gray-600 font-medium text-sm">First Name</h1>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter First Name"
              className="w-full mt-2 rounded-xl border border-slate-300 bg-slate-50 p-3.5 text-sm focus:border-[#020E7C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#020E7C]/15"
              required
            />
          </div>
          <div className="mt-4">
            <h1 className="text-gray-600 font-medium text-sm">Last Name</h1>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter Last Name"
              className="w-full mt-2 rounded-xl border border-slate-300 bg-slate-50 p-3.5 text-sm focus:border-[#020E7C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#020E7C]/15"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-20">
          <div className="mt-4">
            <h1 className="text-gray-600 font-medium text-sm">Email</h1>
            <input
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleChange}
              placeholder="Enter Email"
              className="w-full mt-2 rounded-xl border border-slate-300 bg-slate-50 p-3.5 text-sm focus:border-[#020E7C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#020E7C]/15"
              required
            />
          </div>
          <div className="mt-4">
            <h1 className="text-gray-600 font-medium text-sm">Mobile Number</h1>
            <PhoneInput
              country={"ng"}
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              inputStyle={{
                width: "100%",
                height: "52px",
                borderRadius: "12px",
                borderColor: "#cbd5e1",
                background: "#f8fafc",
              }}
              containerStyle={{ width: "100%" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-20">
          <div className="mt-4">
            <label className="text-gray-600 font-medium text-sm" htmlFor="gender">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full mt-2 rounded-xl border border-slate-300 bg-slate-50 p-3.5 text-sm focus:border-[#020E7C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#020E7C]/15"
            >
              <option value="" disabled>
                Select gender
              </option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div className="mt-4">
            <label
              className="text-gray-600 font-medium text-sm"
              htmlFor="howDidYouHearAboutUs"
            >
              How did you hear about us?
            </label>
            <select
              id="howDidYouHearAboutUs"
              name="howDidYouHearAboutUs"
              value={formData.howDidYouHearAboutUs}
              onChange={handleChange}
              className="w-full mt-2 rounded-xl border border-slate-300 bg-slate-50 p-3.5 text-sm focus:border-[#020E7C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#020E7C]/15"
            >
              <option value="INSTAGRAM">Instagram</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="X">X</option>
              <option value="NEWSPAPER">Newspaper</option>
              <option value="LINKEDIN">LinkedIn</option>
              <option value="OTHERS">Others</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-20">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medical specialization
            </label>
            <select
              type="text"
              name="medicalSpecialization"
              value={formData.medicalSpecialization}
              onChange={handleChange}
              className="w-full mt-2 rounded-xl border border-slate-300 bg-slate-50 p-3.5 text-sm focus:border-[#020E7C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#020E7C]/15"
              placeholder="Enter here"
            >
              {specialization.map((specialization, index) => (
                <option
                  key={index}
                  value={specialization}
                  className="w-full border-none outline-none cursor-pointer"
                >
                  {formatSpecialization(specialization)}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name of Hospital
            </label>
            <input
              type="text"
              name="hospital"
              value={formData.hospital}
              onChange={handleChange}
              className="w-full mt-2 rounded-xl border border-slate-300 bg-slate-50 p-3.5 text-sm focus:border-[#020E7C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#020E7C]/15"
              placeholder="Enter here"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-20">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3.5 pr-12 text-sm focus:border-[#020E7C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#020E7C]/15"
                placeholder="Password"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#020E7C] p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum 8 characters required
            </p>
            {error && error.includes("8 characters") && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative mt-2">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmedPassword"
                value={formData.confirmedPassword}
                onChange={handleChange}
                minLength={8}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3.5 pr-12 text-sm focus:border-[#020E7C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#020E7C]/15"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#020E7C] p-1"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {error && error.includes("match") && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
        </div>

        <div className="flex space-x-10 flex-col md:flex-row mt-4">
          {/* <Modal /> */}
          <a onClick={() => navigate("/login")} className="text-sm font-medium">
            Already have an account?{" "}
            <span className="text-[#020E7C] cursor-pointer">Login here</span>
          </a>
        </div>
        {/* <div className='mt-4 flex items-center font-bold'>
        <input
          type='checkbox'
          name='acceptTerms'
          checked={formData.acceptTerms}
          onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
          className='form-checkbox'
        />
        <span className='text-sm ml-2'>
          Accept the{' '}
          <a href='#' className='text-[#020E7C]'>
            Terms and Conditions of Medfair{' '}
          </a>
        </span>
        {error && !formData.acceptTerms && <p className='text-red-500 text-sm'>{error}</p>}
      </div> */}

        <button
          type="submit"
          disabled={
            loading ||
            !formData.password ||
            formData.password.length < 8 ||
            formData.password !== formData.confirmedPassword
          }
          className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl border border-transparent bg-[#020E7C] px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? <ColorRing color="#fff" height={20} width={20} /> : "Next"}
        </button>
      </form>
      <div className="text-center mt-4 mb-12">
        <a href="/patient_signup" target="" className="text-blue-500">
          <p>Signup as Patient</p>
        </a>
      </div>
    </div>
  );
}
