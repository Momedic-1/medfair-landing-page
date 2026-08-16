import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as Preline from "preline";
import PatientSignupForm from "./PatientSignup/PatientSignupForm";
import SignupRoleSelect from "./components/signup/SignupRoleSelect";
import VerificationInput from "./PatientSignup/VerificationInput";
import VerificationSuccessful from "./PatientSignup/VerificationSuccessful";
import ErrorModal from "./components/ErrorModal";
import DesignedSideBar from "./components/reuseables/DesignedSideBar";
import Steps from "./Steps.jsx";
import { baseUrl } from "./env";
import { setPatientPartnerSlug } from "./utils";
import { parseApiError } from "./utils/parseApiError";
import { isValidPhoneE164, phoneValidationMessage } from "./utils/phoneE164";
import LoadingLoop from "./assets/LoadingLoop.jsx";

const PatientSignup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const partnerSlugFromUrl = searchParams.get("partner")?.trim() || null;

  useEffect(() => {
    if (Preline.HSStepperJS && typeof Preline.HSStepperJS.init === "function") {
      Preline.HSStepperJS.init();
    }

    if (partnerSlugFromUrl) {
      setPatientPartnerSlug(partnerSlugFromUrl);
      setFormData((prev) => ({
        ...prev,
        partnerSlug: partnerSlugFromUrl,
      }));
    }
  }, [partnerSlugFromUrl]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // After verify success, briefly show confirmation then go to login.
  useEffect(() => {
    if (currentStep !== 3) return undefined;
    const timer = setTimeout(() => navigate("/login"), 1800);
    return () => clearTimeout(timer);
  }, [currentStep, navigate]);

  const stepLabels = ["Account", "Verification", "Login"];

  // Function to check if step 1 form is valid
  const isStep1FormValid = () => {
    const requiredFields = [
      'firstName',
      'lastName', 
      'emailAddress',
      'phoneNumber',
      'gender',
      'password',
      'confirmedPassword'
    ];

    // Check if all required fields are filled
    const allFieldsFilled = requiredFields.every(field => 
      formData[field] && formData[field].toString().trim() !== ''
    );

    // Password minimum 8 characters
    const passwordValid = formData.password && formData.password.length >= 8;

    // Check if passwords match
    const passwordsMatch = formData.password && formData.confirmedPassword &&
                          formData.password === formData.confirmedPassword;

    const phoneValid = isValidPhoneE164(formData.phoneNumber);

    return allFieldsFilled && passwordValid && passwordsMatch && phoneValid;
  };

  // Function to check if step 2 verification token is valid
  const isStep2FormValid = () => {
    return verificationToken && verificationToken.trim().length > 0;
  };

  // Function to determine if Next button should be disabled
  const isNextButtonDisabled = () => {
    if (loading) return true;
    
    switch (currentStep) {
      case 1:
        return !isStep1FormValid();
      case 2:
        return !isStep2FormValid();
      case 3:
        return false;
      default:
        return true;
    }
  };

  const handleResendSuccess = (message) => {
    setSuccessMessage(message);
  };

  const handleResendError = (message) => {
    setErrorMessage(message);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 1:
        return (
          <PatientSignupForm
            formData={formData}
            setFormData={setFormData}
            partnerSlugFromUrl={partnerSlugFromUrl}
          />
        );
      case 2:
        return (
          <VerificationInput
            setVerificationToken={setVerificationToken}
            email={formData.emailAddress}
            onResendSuccess={handleResendSuccess}
            onResendError={handleResendError}
          />
        );
      case 3:
        return <VerificationSuccessful />;
      default:
        return null;
    }
  };

  const handleNextClick = async () => {
    if (currentStep === 1) {
      if (!isValidPhoneE164(formData.phoneNumber)) {
        setErrorMessage(phoneValidationMessage());
        return;
      }
      const formIsValid = await validateForm();
      if (formIsValid) {
        // Account → code (skip check-email interstitial)
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      await verifyEmail();
    } else if (currentStep === 3) {
      navigate("/login");
    }
  };

  async function validateForm() {
    setLoading(true);
    try {
      // Prepare the payload with partner slug if it exists
      const payload = {
        ...formData,
      };

      const slug = formData.partnerSlug?.trim();
      if (slug) {
        payload.partnerSlug = slug;
        setPatientPartnerSlug(slug);
      }

      const response = await fetch(
        `${baseUrl}/api/v1/registration/patients-registrations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const responseText = await response.text();
      let result = {};
      try {
        result = JSON.parse(responseText);
      } catch {
        setLoading(false);
        setErrorMessage("Error parsing server response.");
        return false;
      }

      if (response.ok) {
        const continueVerification =
          result?.message === "CONTINUE_VERIFICATION" ||
          result?.data?.continueVerification === true;
        setLoading(false);
        if (continueVerification) {
          setSuccessMessage(
            result?.exceptionMessage ||
              "You already started signup. Enter the verification code we just emailed you.",
          );
        }
        return true;
      } else {
        setLoading(false);
        setErrorMessage(
          parseApiError(
            { response: { data: result } },
            result.exceptionMessage || "Form submission failed.",
          ),
        );
        return false;
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage("Error submitting form. Please try again.");
      return false;
    }
  }

  async function verifyEmail() {
    setLoading(true);
    const verificationData = {
      token: verificationToken,
      email: formData.emailAddress,
    };

    try {
      const response = await fetch(
        `${baseUrl}/api/v1/registration/verify-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(verificationData),
        }
      );

      const contentType = response.headers.get("Content-Type");
      let result =
        contentType && contentType.includes("application/json")
          ? await response.json()
          : await response.text();

      const ok =
        typeof result === "string"
          ? result.toLowerCase().includes("verification successful")
          : Boolean(
              result?.isSuccessful ||
                result?.message?.toLowerCase?.().includes("success"),
            );

      if (ok || (typeof result === "string" && result.includes("Email verification successful"))) {
        setLoading(false);
        setCurrentStep(3);
      } else {
        setLoading(false);
        setErrorMessage("Incorrect token! Please try again.");
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage("Something went wrong. Try again!");
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[380px_1fr]">
      <DesignedSideBar className="hidden lg:flex lg:min-h-screen" />
      <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-slate-50 to-blue-50/40 px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-6 rounded-2xl border border-blue-100 bg-white/80 p-4 text-center shadow-sm backdrop-blur lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#020e7c]/70">
              Medfair
            </p>
            <p className="mt-1 text-sm text-gray-600">Patient signup</p>
          </div>

          <div className="mb-6 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#020e7c]/70">
              Create account
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#020e7c] sm:text-3xl">
              Patient signup
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {formData.partnerSlug
                ? `Partner: ${formData.partnerSlug}`
                : "Fill in your details to get started."}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6 md:p-8">
            <div className="mx-auto mb-6 max-w-md">
              <SignupRoleSelect value="PATIENT" />
            </div>

            <Steps stepLabels={stepLabels} currentStep={currentStep} />

            {successMessage ? (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-800">
                {successMessage}
              </div>
            ) : null}

            <div>{renderStepContent(currentStep)}</div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleNextClick}
                disabled={isNextButtonDisabled()}
                className={`inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-white sm:w-auto sm:min-w-[9rem] ${
                  isNextButtonDisabled()
                    ? "cursor-not-allowed bg-gray-400 opacity-60"
                    : "bg-[#020e7c] hover:bg-[#010a5c]"
                }`}
              >
                {loading ? (
                  <>
                    <LoadingLoop />
                    <span className="ml-2">Processing…</span>
                  </>
                ) : (
                  <span>
                    {currentStep === 3
                      ? "Continue to sign in"
                      : currentStep === 2
                        ? "Verify & continue"
                        : "Next"}
                  </span>
                )}
              </button>
            </div>

            <ErrorModal message={errorMessage} onClose={() => setErrorMessage("")} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSignup;