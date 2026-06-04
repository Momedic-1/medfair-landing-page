import { useState, useEffect } from "react";
import { Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PartnerOrganizationSelect from "../components/signup/PartnerOrganizationSelect";
import { setPatientPartnerSlug } from "../utils";

export default function PatientSignupForm({
  formData = {},
  setFormData = () => {},
  partnerSlugFromUrl = null,
}) {
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        medicalSpecialization: "string",
        nameOfHospital: "string",
        howDidYouHearAboutUs: "NEWSPAPER",
        userRole: "PATIENT",
      };

      if (partnerSlugFromUrl) {
        updatedData.partnerSlug = partnerSlugFromUrl;
      }

      return updatedData;
    });
  }, [setFormData, partnerSlugFromUrl]);

  const handlePartnerChange = (slug) => {
    if (slug) {
      setPatientPartnerSlug(slug);
    }
    setFormData((prev) => {
      const next = { ...prev };
      if (slug) {
        next.partnerSlug = slug;
      } else {
        delete next.partnerSlug;
      }
      return next;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);

    if (name === "password" || name === "confirmedPassword") {
      const password = name === "password" ? value : formData.password;
      const confirmed = name === "confirmedPassword" ? value : formData.confirmedPassword;
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
    const updatedFormData = {
      ...formData,
      phoneNumber: phone,
    };
    setFormData(updatedFormData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const navigateToLogin = () => {
    navigate("/login");
  };

  const fieldBoxClass =
    "h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 text-sm text-gray-900 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20";

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 py-8 md:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            Create Your Account
          </h1>
          <p className="text-gray-600">
            Join Medfair and manage your care in one place
          </p>
        </div>

        {/* Main Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
        >
          <div className="bg-gradient-to-r from-violet-600 to-blue-600 p-6">
            <h2 className="text-xl font-semibold text-white flex items-center justify-center space-x-2">
              <User className="w-6 h-6" />
              <span>Personal Information</span>
            </h2>
          </div>

          <div className="space-y-6 p-4 md:p-8">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <User className="w-4 h-4 text-violet-600" />
                  <span>First Name</span>
                </label>
                <input
                  required
                  type="text"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className={fieldBoxClass}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <User className="w-4 h-4 text-violet-600" />
                  <span>Last Name</span>
                </label>
                <input
                  required
                  type="text"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className={fieldBoxClass}
                />
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-violet-600" />
                  <span>Email Address</span>
                </label>
                <input
                  required
                  type="email"
                  name="emailAddress"
                  placeholder="your.email@example.com"
                  value={formData.emailAddress || ""}
                  onChange={handleChange}
                  className={fieldBoxClass}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-violet-600" />
                  <span>Mobile Number</span>
                </label>
                <input
                  required
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+234 xxx xxx xxxx"
                  className={fieldBoxClass}
                />
              </div>
            </div>

            {/* Gender and Referral Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="gender">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender || ""}
                  onChange={handleChange}
                  className={fieldBoxClass}
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700" htmlFor="referralCode">
                  Referral Code{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="referralCode"
                  type="text"
                  name="referralCode"
                  value={formData.referralCode || ""}
                  onChange={handleChange}
                  placeholder="Referral code"
                  className={fieldBoxClass}
                />
              </div>
            </div>

            <PartnerOrganizationSelect
              value={formData.partnerSlug || ""}
              onChange={handlePartnerChange}
              lockedSlug={partnerSlugFromUrl}
              fieldClass={fieldBoxClass}
            />

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-violet-600" />
                  <span>Password</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    minLength={8}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password || ""}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    className={`${fieldBoxClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Minimum 8 characters required</p>
                {error && error.includes("8 characters") && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-violet-600" />
                  <span>Confirm Password</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmedPassword"
                    value={formData.confirmedPassword || ""}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`${fieldBoxClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-violet-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {error && error.includes("match") && (
                  <div className="flex items-center space-x-2 text-red-500 text-sm">
                    <span>⚠</span>
                    <span>Passwords do not match</span>
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-lg space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  required
                  type="checkbox"
                  className="mt-1 w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  I accept the{" "}
                  <a
                    href="#"
                    className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
                  >
                    Terms and Conditions
                  </a>
                  ,{" "}
                  <a
                    href="#"
                    className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
                  >
                    Operating Policies
                  </a>{" "}
                  {/* and{" "}
                  <a
                    href="#"
                    className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
                  >
                    Cookie Policies
                  </a>{" "} */}
                  of Medfair
                </span>
              </label>
            </div>

            {/* Login Link */}
            <div className="text-start">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={navigateToLogin}
                  className="text-violet-600 hover:text-violet-700 font-semibold transition-colors"
                >
                  Login here
                </button>
              </p>
            </div>

            {/* Submit Button */}
            {/* <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 shadow-lg"
            >
              Create Account
            </button> */}
          </div>
        </form>
      </div>
    </div>
  );
}
