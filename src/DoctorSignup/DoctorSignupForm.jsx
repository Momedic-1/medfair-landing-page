import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SignUpTop from "./SignUpTop.jsx";
import Steps from "../Steps.jsx";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { baseUrl } from "../env.jsx";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { ColorRing } from "react-loader-spinner";
import { Eye, EyeOff } from "lucide-react";
import SignupRoleSelect from "../components/signup/SignupRoleSelect";
import DesignedSideBar from "../components/reuseables/DesignedSideBar";
import { toE164, isValidPhoneE164, phoneValidationMessage } from "../utils/phoneE164";

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

  const handlePhoneChange = (phone, country) => {
    setFormData({
      ...formData,
      phoneNumber: toE164(phone),
      _phoneCountry: country || formData._phoneCountry,
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
    if (!isValidPhoneE164(formData.phoneNumber, formData._phoneCountry)) {
      const msg = phoneValidationMessage(formData._phoneCountry);
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    // if (!formData.acceptTerms) {
    //   setError('You must accept the terms and conditions');
    //   return;
    // }

    try {
      const { _phoneCountry, ...registrationPayload } = formData;
      const response = await axios.post(
        `${baseUrl}/api/v1/registration/doctors-registration`,
        {
          ...registrationPayload,
          phoneNumber: toE164(formData.phoneNumber),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const payload = response.data || {};
      const continueVerification =
        payload.message === "CONTINUE_VERIFICATION" ||
        payload.data?.continueVerification === true;

      localStorage.setItem("email", JSON.stringify(formData.emailAddress));
      setLoading(false);

      if (continueVerification) {
        toast.info(
          payload.exceptionMessage ||
            "You already started signup. Enter the verification code we emailed you.",
        );
      } else {
        toast.success(payload.message || "Registration was successful");
      }
      navigate("/verify-email");
    } catch (error) {
      setLoading(false);
      let exceptionMessage = "";
      if (error.response) {
        exceptionMessage =
          error.response.data?.exceptionMessage ||
          error.response.data?.message ||
          "Registration failed";
        toast.error(exceptionMessage);
      }

      console.error("Registration failed:", exceptionMessage);
    }
  };
  const stepLabels = ["Account", "Verification", "Login"];
  const fieldClass =
    "w-full h-11 rounded-xl border border-gray-200 bg-gray-50/80 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#020e7c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#020e7c]/15";
  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500";

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[380px_1fr]">
      <DesignedSideBar className="hidden lg:flex lg:min-h-screen" />
      <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-slate-50 to-blue-50/40 px-4 py-6 sm:px-6 sm:py-10">
        <ToastContainer />
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-6 rounded-2xl border border-blue-100 bg-white/80 p-4 text-center shadow-sm backdrop-blur lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#020e7c]/70">
              Medfair
            </p>
            <p className="mt-1 text-sm text-gray-600">Doctor signup</p>
          </div>

          <SignUpTop />

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6 md:p-8"
          >
            <Steps stepLabels={stepLabels} currentStep={1} />

            <SignupRoleSelect
              value="DOCTOR"
              fieldClass={fieldClass}
              className="mb-6 max-w-md"
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>First name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  className={fieldClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Last name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className={fieldClass}
                  required
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  placeholder="you@email.com"
                  className={fieldClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Mobile number</label>
                <PhoneInput
                  country={"ng"}
                  enableSearch
                  preferredCountries={["ng", "gh", "ke", "za", "gb", "us", "ca"]}
                  value={(formData.phoneNumber || "").replace(/^\+/, "")}
                  onChange={handlePhoneChange}
                  inputStyle={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "12px",
                    borderColor: "#e5e7eb",
                    background: "rgba(249,250,251,0.8)",
                    fontSize: "14px",
                  }}
                  containerStyle={{ width: "100%" }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="gender">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="howDidYouHearAboutUs">
                  How did you hear about us?
                </label>
                <select
                  id="howDidYouHearAboutUs"
                  name="howDidYouHearAboutUs"
                  value={formData.howDidYouHearAboutUs}
                  onChange={handleChange}
                  className={fieldClass}
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

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Medical specialization</label>
                <select
                  name="medicalSpecialization"
                  value={formData.medicalSpecialization}
                  onChange={handleChange}
                  className={fieldClass}
                >
                  {specialization.map((item, index) => (
                    <option key={index} value={item}>
                      {formatSpecialization(item)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Hospital name</label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  className={fieldClass}
                  placeholder="Hospital"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={8}
                    className={`${fieldClass} pr-11`}
                    placeholder="Min. 8 characters"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#020e7c]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {error && error.includes("8 characters") ? (
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                ) : null}
              </div>
              <div>
                <label className={labelClass}>Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmedPassword"
                    value={formData.confirmedPassword}
                    onChange={handleChange}
                    minLength={8}
                    className={`${fieldClass} pr-11`}
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#020e7c]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {error && error.includes("match") ? (
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                ) : null}
              </div>
            </div>

            <p className="mt-5 text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-semibold text-[#020e7c] hover:underline"
              >
                Sign in
              </button>
            </p>

            <button
              type="submit"
              disabled={
                loading ||
                !formData.password ||
                formData.password.length < 8 ||
                formData.password !== formData.confirmedPassword
              }
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#020e7c] text-sm font-semibold text-white hover:bg-[#010a5c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <ColorRing color="#fff" height={20} width={20} /> : "Continue"}
            </button>

            <p className="mt-4 text-center text-sm text-gray-500">
              Signing up as a patient?{" "}
              <Link to="/patient_signup" className="font-semibold text-[#020e7c] hover:underline">
                Patient signup
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
