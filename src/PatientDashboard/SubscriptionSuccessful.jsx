import React, { useState, useEffect } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { getToken } from "../utils";
import { baseUrl } from "../env";
import { useNavigate } from "react-router-dom";

export default function SubscriptionSuccessful() {
  const [reference, setReference] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  const navigate = useNavigate();

  // Verify payment function using your utils
  const verifyPayment = async (reference) => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${baseUrl}/api/payment/verify?reference=${reference}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Payment verification error:", error);
      throw error;
    }
  };

  useEffect(() => {
    // Get reference from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const referenceParam = urlParams.get("reference");

    if (!referenceParam) {
      // If no reference, redirect to unsuccessful page
      window.location.href = "/patient-dashboard/subscription-unsuccessful";
      return;
    }

    setReference(referenceParam);

    // Verify the payment
    const handleVerification = async () => {
      try {
        const result = await verifyPayment(referenceParam);

        if (
          result.status &&
          result.status.includes("subscription-unsuccessful")
        ) {
          // Payment failed, redirect to unsuccessful page
          window.location.href = `/patient-dashboard/subscription-unsuccessful?reference=${referenceParam}`;
          return;
        }

        setIsVerified(true);
        setIsVerifying(false);
      } catch (error) {
        console.error("Verification failed:", error);
        // On error, redirect to unsuccessful page
        window.location.href = `/patient-dashboard/subscription-unsuccessful?reference=${referenceParam}`;
      }
    };

    handleVerification();
  }, []);

  // Show loading while verifying
  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex justify-center">
            <Loader2 className="w-20 h-20 text-blue-500 animate-spin" />
          </div>
          <h1 className="mt-6 text-2xl md:text-3xl font-bold text-gray-800">
            Verifying Payment
          </h1>
          <p className="mt-3 text-gray-600 text-sm md:text-base">
            Please wait while we verify your payment...
          </p>
        </div>
      </div>
    );
  }

  // Only show success if payment is verified
  if (!isVerified) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="flex justify-center">
          <CheckCircle2 className="w-20 h-20 text-green-500" />
        </div>

        {/* Title */}
        <h1 className="mt-6 text-2xl md:text-3xl font-bold text-gray-800">
          Payment Successful
        </h1>

        {/* Description */}
        <p className="mt-3 text-gray-600 text-sm md:text-base">
          Your subscription has been activated successfully. You can now enjoy
          all the premium features available to you.
        </p>

        {/* Transaction Reference */}
        {reference && (
          <div className="flex flex-col items-center justify-center mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Transaction Reference:</strong> {reference}
            </p>
          </div>
        )}

        {/* Button */}
        <button
          onClick={() => navigate("/patient-dashboard")}
          className="mt-6 w-full bg-green-500 hover:bg-green-600 cursor-pointer text-white font-medium py-3 px-6 rounded-xl transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
