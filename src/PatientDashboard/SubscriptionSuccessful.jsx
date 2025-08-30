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


import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import axios from "axios";
import { getToken } from "../utils";
import { baseUrl } from "../env";

export default function SubscriptionSuccessful() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(true);

  // Extract reference from query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("reference");
    if (ref) {
      setReference(ref);
      verifyPayment(ref);
    } else {
      // No reference found, redirect to dashboard
      setLoading(false);
      navigate("/patient-dashboard");
    }
  }, [location.search, navigate]);

  // Verify payment API
  const verifyPayment = async (ref) => {
    try {
      const token = getToken();

      const res = await axios.get(
        `${baseUrl}/api/payment/verify?reference=${ref}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Check if payment was successful
      if (res.data?.status === "success") {
        setLoading(false);
      } else {
        // Payment failed or status is a URL (unsuccessful), redirect to unsuccessful page
        const failureUrl = typeof res.data?.status === 'string' && res.data.status.startsWith('http') 
          ? res.data.status 
          : "/patient-dashboard/subscription-unsuccessful";
        window.location.href = failureUrl;
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      // Redirect to unsuccessful page on error
      navigate("/patient-dashboard/subscription-unsuccessful");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
          </div>
          <h1 className="mt-6 text-2xl md:text-3xl font-bold text-gray-800">
            Verifying Payment...
          </h1>
          <p className="mt-3 text-gray-600 text-sm md:text-base">
            Please wait while we confirm your payment.
          </p>
        </div>
      </div>
    );
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
          Payment Successful!
        </h1>

        {/* Transaction Reference */}
        {reference && (
          <p className="mt-3 text-gray-700 font-medium">
            Transaction Reference:{" "}
            <span className="text-gray-900">{reference}</span>
          </p>
        )}

        {/* Description */}
        <p className="mt-3 text-gray-600 text-sm md:text-base">
          Your subscription has been activated successfully. You can now enjoy
          all the premium features available to you.
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/patient-dashboard")}
          className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-xl transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}