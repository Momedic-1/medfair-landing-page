// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { CheckCircle2 } from "lucide-react";
// import axios from "axios";
// import { getToken } from "../utils";
// import { baseUrl } from "../env";

// export default function SubscriptionSuccessful() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [reference, setReference] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [verified, setVerified] = useState(false);

//   // Extract reference from query string
//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const ref = params.get("reference");
//     if (ref) {
//       setReference(ref);
//       verifyPayment(ref);
//     } else {
//       setLoading(false);
//     }
//   }, [location.search]);

//   // Verify payment API
//   const verifyPayment = async (ref) => {
//     try {
//       const token = getToken();

//       const res = await axios.get(
//         `${baseUrl}/api/payment/verify?reference=${ref}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (res.data?.status === "success") {
//         setVerified(true);
//       } else {
//         setVerified(false);
//       }
//     } catch (error) {
//       console.error("Payment verification failed:", error);
//       setVerified(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
//       <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
//         {/* Success Icon */}
//         <div className="flex justify-center">
//           <CheckCircle2 className="w-20 h-20 text-green-500" />
//         </div>

//         {/* Title */}
//         <h1 className="mt-6 text-2xl md:text-3xl font-bold text-gray-800">
//           {loading
//             ? "Verifying Payment..."
//             : verified
//             ? "Payment Successful"
//             : "Payment Verification Failed"}
//         </h1>

//         {/* Transaction Reference */}
//         {!loading && reference && (
//           <p className="mt-3 text-gray-700 font-medium">
//             Transaction Reference:{" "}
//             <span className="text-gray-900">{reference}</span>
//           </p>
//         )}

//         {/* Description */}
//         {!loading && verified && (
//           <p className="mt-3 text-gray-600 text-sm md:text-base">
//             Your subscription has been activated successfully. You can now enjoy
//             all the premium features available to you.
//           </p>
//         )}

//         {/* Button */}
//         {!loading && (
//           <button
//             onClick={() => navigate("/patient-dashboard")}
//             className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-xl transition"
//           >
//             Go to Dashboard
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { getToken } from "../utils";
import { baseUrl } from "../env";

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
          "accept": "*/*",
          "Authorization": `Bearer ${token}`,
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

export default function SubscriptionSuccessful() {
  const [verificationStatus, setVerificationStatus] = useState("loading");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");

  // Mock navigation function - replace with actual navigation
  const navigate = (path) => {
    console.log(`Navigating to: ${path}`);
    // In your actual app, use: navigate(path);
  };

  useEffect(() => {
    // Get reference from URL params - replace with actual implementation
    const urlParams = new URLSearchParams(window.location.search);
    const referenceParam = urlParams.get("reference");
    
    if (!referenceParam) {
      setVerificationStatus("error");
      setMessage("No payment reference found");
      return;
    }

    setReference(referenceParam);
    
    // Verify payment
    const handleVerification = async () => {
      try {
        const result = await verifyPayment(referenceParam);
        
        // Check if the status URL indicates success or failure
        if (result.status && result.status.includes("subscription-unsuccessful")) {
          setVerificationStatus("failed");
          setMessage(result.message || "Payment verification failed");
        } else if (result.message && result.message.toLowerCase().includes("success")) {
          setVerificationStatus("success");
          setMessage(result.message || "Payment verified successfully");
        } else {
          // Default to failed if we can't determine success
          setVerificationStatus("failed");
          setMessage(result.message || "Payment verification failed");
        }
      } catch (error) {
        setVerificationStatus("error");
        setMessage("Unable to verify payment. Please contact support.");
      }
    };

    handleVerification();
  }, []);

  const renderContent = () => {
    switch (verificationStatus) {
      case "loading":
        return (
          <>
            <div className="flex justify-center">
              <Loader2 className="w-20 h-20 text-blue-500 animate-spin" />
            </div>
            <h1 className="mt-6 text-2xl md:text-3xl font-bold text-gray-800">
              Verifying Payment
            </h1>
            <p className="mt-3 text-gray-600 text-sm md:text-base">
              Please wait while we verify your payment...
            </p>
          </>
        );

      case "success":
        return (
          <>
            <div className="flex justify-center">
              <CheckCircle2 className="w-20 h-20 text-green-500" />
            </div>
            <h1 className="mt-6 text-2xl md:text-3xl font-bold text-gray-800">
              Payment Successful
            </h1>
            <p className="mt-3 text-gray-600 text-sm md:text-base">
              Your subscription has been activated successfully. You can now enjoy
              all the premium features available to you.
            </p>
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Transaction Reference:</strong> {reference}
              </p>
            </div>
            <button
              onClick={() => navigate("/patient-dashboard")}
              className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-xl transition"
            >
              Go to Dashboard
            </button>
          </>
        );

      case "failed":
      case "error":
        return (
          <>
            <div className="flex justify-center">
              <XCircle className="w-20 h-20 text-red-500" />
            </div>
            <h1 className="mt-6 text-2xl md:text-3xl font-bold text-gray-800">
              Payment {verificationStatus === "failed" ? "Failed" : "Error"}
            </h1>
            <p className="mt-3 text-gray-600 text-sm md:text-base">
              {message}
            </p>
            {reference && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Transaction Reference:</strong> {reference}
                </p>
              </div>
            )}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate("/subscription")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/patient-dashboard")}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl transition"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {renderContent()}
      </div>
    </div>
  );
}