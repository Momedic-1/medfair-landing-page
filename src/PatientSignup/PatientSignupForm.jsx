import { useState, useEffect } from "react";
import { Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import PartnerOrganizationSelect from "../components/signup/PartnerOrganizationSelect";
import { setPatientPartnerSlug } from "../utils";
import { toE164, isValidPhoneE164, phoneValidationMessage } from "../utils/phoneE164";

export default function PatientSignupForm({
  formData = {},
  setFormData = () => {},
  partnerSlugFromUrl = null,
}) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [phoneCountry, setPhoneCountry] = useState({ dialCode: "234", countryCode: "ng" });
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
      const confirmed =
        name === "confirmedPassword" ? value : formData.confirmedPassword;
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
    if (country?.dialCode) setPhoneCountry(country);
    const normalized = toE164(phone);
    setFormData({
      ...formData,
      phoneNumber: normalized,
    });
    if (normalized && !isValidPhoneE164(normalized, country || phoneCountry)) {
      setError(phoneValidationMessage(country || phoneCountry));
    } else if (error?.startsWith("Enter a valid mobile")) {
      setError("");
    }
  };

  const fieldBoxClass =
    "h-11 w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#020e7c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#020e7c]/15";
  const labelClass =
    "mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500";

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            <User className="h-3.5 w-3.5 text-[#020e7c]" />
            First name
          </label>
          <input
            required
            type="text"
            name="firstName"
            value={formData.firstName || ""}
            onChange={handleChange}
            placeholder="First name"
            className={fieldBoxClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            <User className="h-3.5 w-3.5 text-[#020e7c]" />
            Last name
          </label>
          <input
            required
            type="text"
            name="lastName"
            value={formData.lastName || ""}
            onChange={handleChange}
            placeholder="Last name"
            className={fieldBoxClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            <Mail className="h-3.5 w-3.5 text-[#020e7c]" />
            Email
          </label>
          <input
            required
            type="email"
            name="emailAddress"
            placeholder="you@email.com"
            value={formData.emailAddress || ""}
            onChange={handleChange}
            className={fieldBoxClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            <Phone className="h-3.5 w-3.5 text-[#020e7c]" />
            Mobile
          </label>
          <PhoneInput
            country="ng"
            enableSearch
            preferredCountries={["ng", "gh", "ke", "za", "gb", "us", "ca"]}
            value={(formData.phoneNumber || "").replace(/^\+/, "")}
            onChange={handlePhoneChange}
            inputProps={{
              name: "phoneNumber",
              required: true,
              autoComplete: "tel",
            }}
            containerClass="w-full"
            inputClass="!w-full !h-11 !rounded-xl !border !border-gray-200 !bg-gray-50/80 !text-sm !text-gray-900 !pl-12 focus:!border-[#020e7c] focus:!bg-white focus:!ring-2 focus:!ring-[#020e7c]/15"
            buttonClass="!rounded-l-xl !border !border-gray-200 !bg-gray-50/80"
            dropdownClass="!rounded-xl !shadow-lg"
          />
          {error?.startsWith("Enter a valid mobile") ? (
            <p className="mt-1 text-xs text-red-600">{error}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="gender">
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
        <div>
          <label className={labelClass} htmlFor="referralCode">
            Referral code{" "}
            <span className="normal-case text-gray-400">(optional)</span>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            <Lock className="h-3.5 w-3.5 text-[#020e7c]" />
            Password
          </label>
          <div className="relative">
            <input
              required
              minLength={8}
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password || ""}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              className={`${fieldBoxClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#020e7c]"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {error && error.includes("8 characters") ? (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          ) : null}
        </div>
        <div>
          <label className={labelClass}>
            <Lock className="h-3.5 w-3.5 text-[#020e7c]" />
            Confirm password
          </label>
          <div className="relative">
            <input
              required
              type={showConfirmPassword ? "text" : "password"}
              name="confirmedPassword"
              value={formData.confirmedPassword || ""}
              onChange={handleChange}
              placeholder="Confirm password"
              className={`${fieldBoxClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
            <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
          ) : null}
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-xl bg-gray-50 px-3 py-3 text-sm text-gray-700">
        <input
          required
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-gray-300 text-[#020e7c] focus:ring-[#020e7c]"
        />
        <span>
          I accept the{" "}
          <a href="#" className="font-medium text-[#020e7c] hover:underline">
            Terms and Conditions
          </a>{" "}
          and{" "}
          <a href="#" className="font-medium text-[#020e7c] hover:underline">
            Operating Policies
          </a>{" "}
          of Medfair
        </span>
      </label>

      <p className="text-sm text-gray-600">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="font-semibold text-[#020e7c] hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
