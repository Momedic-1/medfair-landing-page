import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function SubscriptionSuccessful() {
  const navigate = useNavigate();

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
