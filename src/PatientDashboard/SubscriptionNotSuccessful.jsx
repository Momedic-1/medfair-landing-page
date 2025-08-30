import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function SubscriptionNotSuccessful() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="flex justify-center">
          <XCircle className="w-20 h-20 text-red-500" />
        </div>

        {/* Title */}
        <h1 className="mt-6 text-2xl md:text-3xl font-bold text-gray-800">
          Payment Failed
        </h1>

        {/* Description */}
        <p className="mt-3 text-gray-600 text-sm md:text-base">
          Something went wrong while processing your payment.  
          Please try again or contact support if the issue persists.
        </p>

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => navigate("/subscription")}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-xl transition"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-xl transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
