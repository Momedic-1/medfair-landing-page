import { useState, useEffect } from "react";
import { Eye, EyeOff, User, Mail, Phone, Lock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PatientSignupForm({
  formData = {},
  setFormData = () => {},
  partnerSlug,
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

      // Add partnerSlug if it exists
      if (partnerSlug) {
        updatedData.partnerSlug = partnerSlug;
      }

      return updatedData;
    });
  }, [setFormData, partnerSlug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);

    if (name === "password" || name === "confirmedPassword") {
      if (formData.password !== value && name === "confirmedPassword") {
        setError("Passwords do not match");
      } else if (formData.confirmedPassword !== value && name === "password") {
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
    // This would normally use navigate("/login")
    console.log("Navigate to login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 rounded-lg py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600">
            Join Medfair and start your healthcare journey
          </p>
        </div>

        {/* Partner indicator */}
        {partnerSlug && (
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Partner Registration:</span> You
                are signing up through{" "}
                <strong className="text-blue-900">{partnerSlug}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-blue-600 p-6">
            <h2 className="text-xl font-semibold text-white flex items-center justify-center space-x-2">
              <User className="w-6 h-6" />
              <span>Personal Information</span>
            </h2>
          </div>

          <div className="p-4 md:p-8 space-y-8">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-violet-600" />
                  <span>Mobile Number</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+234 xxx xxx xxxx"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Gender and Referral Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Gender
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      required
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === "Male"}
                      onChange={handleChange}
                      className="w-4 h-4 text-violet-600  border-gray-300 focus:ring-violet-500 cursor-pointer"
                    />
                    <span className="text-gray-700 group-hover:text-violet-600 transition-colors">
                      Male
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      required
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === "Female"}
                      onChange={handleChange}
                      className="w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500 cursor-pointer"
                    />
                    <span className="text-gray-700 group-hover:text-violet-600 transition-colors">
                      Female
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Referral Code{" "}
                  <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="referralCode"
                  value={formData.referralCode || ""}
                  onChange={handleChange}
                  placeholder="Enter referral code if you have one"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>
            </div>

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
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password || ""}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-violet-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
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
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-violet-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {error && (
                  <div className="flex items-center space-x-2 text-red-500 text-sm">
                    <span>⚠</span>
                    <span>Passwords do not match</span>
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
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
                  and{" "}
                  <a
                    href="#"
                    className="text-violet-600 hover:text-violet-700 font-medium transition-colors"
                  >
                    Cookie Policies
                  </a>{" "}
                  of Medfair
                </span>
              </label>
            </div>

            {/* Login Link */}
            <div className="text-center">
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
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 shadow-lg"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
