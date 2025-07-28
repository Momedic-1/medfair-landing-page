import { useState, useRef } from "react";
import { baseUrl } from "../env";
import LoadingLoop from "../assets/LoadingLoop.jsx";

const VerificationInput = ({
  setVerificationToken,
  email,
  onResendSuccess,
  onResendError,
}) => {
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (index === 4) {
      // When the last input is filled, set the verification token
      setVerificationToken(newCode.join(""));
    } else if (value && index < 4) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0) return;

    setIsResending(true);

    try {
      const response = await fetch(`${baseUrl}/api/v1/registration/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const responseText = await response.text();
      let result = {};

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error("Error parsing server response");
      }

      if (response.ok) {
        // Success - start cooldown timer
        setResendCooldown(60); // 60 second cooldown
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        if (onResendSuccess) {
          onResendSuccess("Verification code resent successfully!");
        }
      } else {
        throw new Error(result.message || "Failed to resend verification code");
      }
    } catch (error) {
      if (onResendError) {
        onResendError(
          error.message ||
            "Failed to resend verification code. Please try again."
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-white p-2 md:p-6 rounded-lg">
      <h2 className="text-xl font-bold text-center mb-4">Check your email!</h2>
      <p className="text-sm text-center text-gray-400 font-medium mb-4">
        A verification code was sent to your email.
      </p>
      <p className="text-sm text-center mb-4 font-medium text-gray-400">
        Enter the 5-digit code to verify your Medfair account
      </p>

      <div className="text-center mb-4">
        {resendCooldown > 0 ? (
          <p className="text-sm text-gray-400">
            Resend available in {resendCooldown}s
          </p>
        ) : (
          <button
            onClick={handleResendEmail}
            disabled={isResending}
            className={`text-sm text-blue-500 hover:text-blue-600 transition-colors ${
              isResending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isResending ? (
              <span className="flex items-center justify-center">
                <LoadingLoop />
                <span className="ml-2">Resending...</span>
              </span>
            ) : (
              "Resend email"
            )}
          </button>
        )}
      </div>

      <div className="flex justify-center space-x-2 mb-8 md:mb-16">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            id={`input-${index}`}
            type="text"
            maxLength="1"
            className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        ))}
      </div>
    </div>
  );
};

export default VerificationInput;
