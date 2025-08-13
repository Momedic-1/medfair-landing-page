import React, { useState, useEffect } from "react";

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) setShowBanner(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setShowBanner(false);
  };

  return (
    showBanner && (
      <div className="fixed bottom-0 w-full z-40 bg-gray-900 text-white p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <p className="text-sm sm:text-base">
          We use cookies to enhance your browsing experience.{" "}
          <a
            href="/cookies-policy"
            target="_blank"
            className="underline cursor-pointer"
          >
            Learn more
          </a>
        </p>
        <div className="flex flex-row items-center justify-center gap-4">
          <button
            onClick={handleAccept}
            className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={handleReject}
            className="border border-white px-4 py-2 rounded hover:bg-white hover:text-gray-900 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    )
  );
};

export default CookieBanner;
