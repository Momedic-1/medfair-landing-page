import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function SubscriptionNotSuccessful() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reference, setReference] = useState("");

  // Extract reference from query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("reference");
    if (ref) setReference(ref);
  }, [location.search]);

  // Build mailto link dynamically
  const mailtoLink = `mailto:hello@medfairtechnologies.com?subject=Payment%20Issue%20-%20Ref:%20${reference}&body=Hello%20Support,%0A%0AI%20encountered%20a%20payment%20failure.%20Here%20is%20my%20reference:%20${reference}%0A%0ARegards,`;

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

        {/* Transaction Reference */}
        {reference && (
          <p className="mt-3 text-gray-700 font-medium">
            Transaction Reference:{" "}
            <span className="text-gray-900">{reference}</span>
          </p>
        )}

        {/* Description */}
        <p className="mt-3 text-gray-600 text-sm md:text-base">
          Something went wrong while processing your payment. Please try again
          or contact support if the issue persists.
        </p>

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => navigate("/patient-dashboard/subscription")}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-xl transition"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate("/patient-dashboard")}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-xl transition"
          >
            Back to Dashboard
          </button>
          <a
            href={mailtoLink}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition block"
          >
            Contact Support
          </a>
        </div>

        {/* Reference Note */}
        {reference && (
          <p className="mt-6 text-sm text-gray-500">
            Reference: Please provide this reference when contacting support.
          </p>
        )}
      </div>
    </div>
  );
}
