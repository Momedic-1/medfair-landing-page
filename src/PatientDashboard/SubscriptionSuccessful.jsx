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
//   const [error, setError] = useState("");

//   // Extract reference from query string
//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const ref = params.get("reference");
//     if (ref) {
//       setReference(ref);
//       verifyPayment(ref);
//     } else {
//       setLoading(false);
//       setError("No payment reference found");
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

//       // Add debugging - remove this after fixing
//       console.log("API Response:", res.data);
//       console.log("Status from API:", res.data?.status);

//       // Check multiple possible response formats
//       if (
//         res.data?.status === "success" ||
//         res.data?.data?.status === "success" ||
//         res.data?.success === true ||
//         res.status === 200
//       ) {
//         setVerified(true);
//       } else {
//         setVerified(false);
//         setError(`Unexpected response: ${JSON.stringify(res.data)}`);
//       }
//     } catch (error) {
//       console.error("Payment verification failed:", error);
//       console.error("Error response:", error.response?.data);
//       setVerified(false);
//       setError(
//         error.response?.data?.message || error.message || "Unknown error"
//       );
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
//           {loading ? "Verifying Payment..." : verified}
//         </h1>

//         {/* Transaction Reference */}
//         {!loading && reference && (
//           <p className="mt-3 text-gray-700 font-medium">
//             Transaction Reference:{" "}
//             <span className="text-gray-900">{reference}</span>
//           </p>
//         )}

//         {/* Error Message for debugging */}
//         {!loading && !verified && error && (
//           <p className="mt-3 text-red-600 text-sm bg-red-50 p-2 rounded">
//             Debug Info: {error}
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


import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { getToken } from "../utils";
import { baseUrl } from "../env";

export default function SubscriptionSuccessful() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  // Extract reference from query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("reference");
    if (ref) {
      setReference(ref.trim()); // Remove any whitespace
      verifyPayment(ref.trim());
    } else {
      setLoading(false);
      setError("No payment reference found");
    }
  }, [location.search]);

  // Verify payment API
  const verifyPayment = async (ref) => {
    try {
      setLoading(true);
      setError("");
      
      const token = getToken();
      
      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log("Verifying payment with reference:", ref);
      console.log("Base URL:", baseUrl);

      const response = await axios.get(
        `${baseUrl}/api/payment/verify`,
        {
          params: { reference: ref }, // Use params instead of query string
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json' // Explicitly request JSON
          },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log("Full response:", response);
      console.log("Response data:", response.data);
      console.log("Response headers:", response.headers);

      // Check if response is HTML (indicates routing issue)
      if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error("API endpoint returned HTML instead of JSON. Please check your backend routing.");
      }

      // Check for successful response
      const isSuccess = 
        response.status === 200 &&
        (response.data?.status === "success" ||
         response.data?.data?.status === "success" ||
         response.data?.success === true);

      if (isSuccess) {
        setVerified(true);
        console.log("Payment verification successful");
      } else {
        setVerified(false);
        setError(`Payment verification failed: ${response.data?.message || 'Unknown error'}`);
      }

    } catch (error) {
      console.error("Payment verification error:", error);
      
      let errorMessage = "Payment verification failed";
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. Please try again.";
      } else if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        console.error("Error response:", error.response.data);
      } else if (error.request) {
        // Request made but no response
        errorMessage = "Network error. Please check your connection.";
      } else {
        // Something else happened
        errorMessage = error.message;
      }
      
      setVerified(false);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (reference) {
      verifyPayment(reference);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        
        {/* Loading State */}
        {loading && (
          <>
            <div className="flex justify-center">
              <Loader2 className="w-20 h-20 text-blue-500 animate-spin" />
            </div>
            <h1 className="mt-6 text-2xl md:text-3xl font-bold text-gray-800">
              Verifying Payment...
            </h1>
            <p className="mt-3 text-gray-600">
              Please wait while we confirm your payment.
            </p>
          </>
        )}

        {/* Success State */}
        {!loading && verified && (
          <>
            <div className="flex justify-center">
              <CheckCircle2 className="w-20 h-20 text-green-500" />
            </div>
            <h1 className="mt-6 text-2xl md:text-3xl font-bold text-gray-800">
              Payment Successful!
            </h1>
            <p className="mt-3 text-gray-600 text-sm md:text-base">
              Your subscription has been activated successfully. You can now enjoy
              all the premium features available to you.
            </p>
          </>
        )}

        {/* Error State */}
        {!loading && !verified && (
          <>
            <div className="flex justify-center">
              <AlertCircle className="w-20 h-20 text-red-500" />
            </div>
            <h1 className="mt-6 text-2xl md:text-3xl font-bold text-gray-800">
              Verification Failed
            </h1>
            <p className="mt-3 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          </>
        )}

        {/* Transaction Reference */}
        {!loading && reference && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Transaction Reference:</p>
            <p className="font-mono text-xs text-gray-800 break-all">{reference}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {!loading && verified && (
            <button
              onClick={() => navigate("/patient-dashboard")}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-xl transition"
            >
              Go to Dashboard
            </button>
          )}
          
          {!loading && !verified && (
            <>
              <button
                onClick={handleRetry}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition"
              >
                Retry Verification
              </button>
              <button
                onClick={() => navigate("/patient-dashboard")}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl transition"
              >
                Go to Dashboard Anyway
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}