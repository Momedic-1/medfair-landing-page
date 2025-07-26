import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as Preline from "preline";
import PatientSignupForm from "./PatientSignup/PatientSignupForm";
import VerificationInput from "./PatientSignup/VerificationInput";
import VerificationSuccessful from "./PatientSignup/VerificationSuccessful";
import CheckEmail from "./PatientSignup/CheckEmail";
import ErrorModal from "./components/ErrorModal";
import { baseUrl } from "./env";
import LoadingLoop from "./assets/LoadingLoop.jsx";

const PatientSignup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showCheckEmail, setShowCheckEmail] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract partner slug from URL parameters
  const partnerSlug = searchParams.get("partner");

  useEffect(() => {
    if (Preline.HSStepperJS && typeof Preline.HSStepperJS.init === "function") {
      Preline.HSStepperJS.init();
    }

    // Debug: Log URL parameters and partner info
    console.log("=== PARTNER SIGNUP DEBUG ===");
    console.log("Full URL:", window.location.href);
    console.log("Search params:", Object.fromEntries(searchParams));
    console.log("Partner slug from URL:", partnerSlug);

    // If partner slug exists, add it to form data
    if (partnerSlug) {
      console.log("Adding partner slug to form data:", partnerSlug);
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          partnerSlug: partnerSlug,
        };
        console.log("Updated form data with partner:", updatedData);
        return updatedData;
      });
    } else {
      // console.log("No partner slug found - regular signup");
    }
  }, [partnerSlug]);

  const stepLabels = ["Account", "Verification", "Login"];

  const renderStepContent = (step) => {
    switch (step) {
      case 1:
        return (
          <PatientSignupForm
            formData={formData}
            setFormData={setFormData}
            partnerSlug={partnerSlug} // Pass partner slug to form component
          />
        );
      case 2:
        return showCheckEmail ? (
          <CheckEmail
            email={formData.emailAddress}
            onAnimationComplete={handleCheckEmailComplete}
          />
        ) : (
          <VerificationInput setVerificationToken={setVerificationToken} />
        );
      case 3:
        return <VerificationSuccessful />;
      default:
        return null;
    }
  };

  const handleNextClick = async () => {
    if (currentStep === 1) {
      const formIsValid = await validateForm();
      if (formIsValid) {
        setShowCheckEmail(true);
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      await verifyEmail();
    } else if (currentStep === 3) {
      navigate("/login");
    }
  };

  const handleCheckEmailComplete = () => {
    setShowCheckEmail(false);
  };

  async function validateForm() {
    setLoading(true);
    try {
      // Prepare the payload with partner slug if it exists
      const payload = {
        ...formData,
      };

      // Only include partnerSlug if it exists
      if (partnerSlug) {
        payload.partnerSlug = partnerSlug;
      } else {
        // console.log("No partnerSlug to add to payload");
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
        setLoading(false);
        return true;
      } else {
        setLoading(false);
        setErrorMessage(result.message || "Form submission failed.");
        return false;
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage("Error submitting form. Please try again.");
      return false;
    } finally {
      // console.log("=== END FORM VALIDATION DEBUG ===");
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

      if (result.includes("Email verification successful")) {
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="px-6 py-10 sm:px-10">
          <h2 className="text-3xl font-bold text-center text-indigo-900">
            Create Patient Account
            {partnerSlug && (
              <span className="block text-sm font-normal text-gray-600 mt-1">
                via {partnerSlug}
              </span>
            )}
          </h2>
          <p className="mt-2 text-center text-gray-600 text-sm">
            Fill in your details to get started
          </p>

          <div className="mt-8">
            <ul className="flex justify-center gap-4">
              {stepLabels.map((label, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-semibold ${
                      currentStep >= index + 1
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700 hidden sm:inline">
                    {label}
                  </span>
                  {index < stepLabels.length - 1 && (
                    <span className="w-6 h-px bg-gray-300 sm:w-12" />
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">{renderStepContent(currentStep)}</div>

          {!showCheckEmail && (
            <div className="mt-4 md:mt-10 flex flex-col sm:flex-row justify-between gap-4">
              {/* {currentStep !== 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentStep((prev) => Math.max(prev - 1, 1))
                  }
                  className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
              )} */}
              <button
                type="button"
                onClick={handleNextClick}
                disabled={loading}
                className={`w-full sm:w-auto inline-flex justify-center items-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-400 transition ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <LoadingLoop />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  <span>{currentStep === 3 ? "Finish" : "Next"}</span>
                )}
              </button>
            </div>
          )}

          <ErrorModal
            message={errorMessage}
            onClose={() => setErrorMessage("")}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientSignup;
