import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function PatientSignupForm({
  formData,
  setFormData,
  partnerSlug,
}) {
  const navigate = useNavigate();
  const [error, setError] = useState(false);

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

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center">
        {/* Partner indicator */}
        {partnerSlug && (
          <div className="w-3xl mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Partner Registration:</span> You are
              signing up through <strong>{partnerSlug}</strong>
            </p>
          </div>
        )}
        <form
          className="bg-white shadow-md w-full lg:w-3/4 p-6"
          onSubmit={handleSubmit}
        >
          <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between mb-6">
            <div className="flex flex-col w-full lg:w-1/2 px-2 mb-4 md:mb-6">
              <h1 className="text-gray-600 font-medium text-sm">First name</h1>
              <input
                required
                type="text"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleChange}
                placeholder="Enter First Name"
                className="border rounded-md p-3 mt-2 w-full bg-gray-100"
              />
            </div>

            <div className="flex flex-col w-full lg:w-1/2 px-2 md:mb-6">
              <h1 className="text-gray-600 font-medium text-sm">Last name</h1>
              <input
                required
                type="text"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleChange}
                placeholder="Enter Last Name"
                className="border rounded-md p-3 mt-2 w-full bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col w-full md:mt-7">
              <h1 className="text-gray-600 font-medium text-sm">
                Email address
              </h1>
              <input
                required
                type="email"
                name="emailAddress"
                placeholder="Enter Email"
                value={formData.emailAddress || ""}
                onChange={handleChange}
                className="border rounded-md p-4 mt-3 w-full bg-gray-100"
              />
            </div>

            <div className="flex flex-col md:mt-7">
              <h1 className="text-gray-600 font-medium text-sm">
                Mobile number
              </h1>
              <div
                className="flex items-center mt-3 "
                style={{ width: "100%" }}
              >
                <div style={{ width: "100%" }}>
                  <PhoneInput
                    country={"ng"}
                    inputStyle={{ width: "100%", height: "53px" }}
                    containerStyle={{ width: "98%" }}
                    value={formData.phoneNumber || ""}
                    onChange={handlePhoneChange}
                  />
                </div>
              </div>
            </div>
          </div>
          <h1 className="mt-3 mb-1 p-2 text-gray-600 font-medium text-sm">
            Sex
          </h1>
          <div className="flex flex-col items-start md:flex-row md:items-center justify-between w-full mb-6">
            <div className="flex items-center gap-x-4 px-2 mb-2 md:mb-0">
              <div className="flex items-center">
                <p className="mr-2">Male</p>
                <input
                  required
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={formData.gender === "Male"}
                  onChange={handleChange}
                  className="rounded-md"
                />
              </div>
              <div className="flex items-center">
                <p className="mr-2">Female</p>
                <input
                  required
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={formData.gender === "Female"}
                  onChange={handleChange}
                  className="rounded-md"
                />
              </div>
            </div>
            <div className="flex flex-col w-full lg:w-1/2 px-2 md:mb-6">
              <h1 className="text-gray-600 font-medium text-sm">
                Referral code (Optional)
              </h1>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode || ""}
                onChange={handleChange}
                placeholder="Enter your referral code"
                className="border rounded-md p-3 mt-2 w-full bg-gray-100"
              />
            </div>
          </div>

          <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between mb-6">
            <div className="flex flex-col w-full lg:w-1/2 px-2 mb-6">
              <h1 className="text-gray-600 font-medium text-sm">
                Password<span className="text-red-600">*</span>
              </h1>
              <input
                required
                type="password"
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                placeholder="Enter Password"
                className="border rounded-md p-3 mt-2 w-full bg-gray-100"
              />
            </div>

            <div className="flex flex-col w-full lg:w-1/2 px-2 mb-6">
              <h1 className="text-gray-600 font-medium text-sm">
                Confirm password
              </h1>
              <input
                required
                type="password"
                name="confirmedPassword"
                value={formData.confirmedPassword || ""}
                onChange={handleChange}
                placeholder="Enter Password"
                className="border rounded-md p-3 mt-2 w-full bg-gray-100"
              />

              {error && (
                <p className="text-red-500 text-sm mt-1">
                  Password and confirmed password do not match
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mt-6">
            <a href="#" className="text-sm font-medium text-gray-900">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-violet-700"
              >
                Login here
              </span>
            </a>
          </div>

          <div className="mt-6 flex items-center">
            <input required type="checkbox" className="rounded-md mr-2 cursor-pointer" />
            <span className="text-sm text-gray-900 font-medium">
              Accept the{" "}
              <a href="#" className="text-violet-700">
                Terms and Conditions, Operating policies{" "}
                <span className="text-gray-900">and</span> cookies policies of
                Medfair
              </a>
            </span>
          </div>
        </form>
      </div>
    </>
  );
}
