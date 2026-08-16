import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { baseUrl } from "../env";

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
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (index === 4) {
      setVerificationToken(newCode.join(""));
    } else if (digit && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    if (!pasted) return;
    const next = ["", "", "", "", ""];
    for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i];
    setCode(next);
    setVerificationToken(pasted.length === 5 ? pasted : next.join(""));
    inputRefs.current[Math.min(pasted.length, 4)]?.focus();
  };

  const handleResendEmail = async () => {
    if (isResending || resendCooldown > 0 || !email) return;
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
      if (!response.ok) {
        throw new Error(result.exceptionMessage || result.message || "Failed to resend verification code");
      }
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      onResendSuccess?.("Verification code resent successfully!");
    } catch (error) {
      onResendError?.(
        error.message || "Failed to resend verification code. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-[#020e7c]/70">
        Verification
      </p>
      <h2 className="mt-2 text-center text-2xl font-bold text-[#020e7c]">
        Enter your code
      </h2>
      <p className="mt-3 text-center text-sm text-gray-600">
        A 5-digit code was sent to{" "}
        <span className="font-semibold text-gray-900">{email || "your email"}</span>.
      </p>

      <div className="mt-6 flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            id={`input-${index}`}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            className="h-12 w-11 rounded-xl border border-gray-200 bg-gray-50/80 text-center text-lg font-semibold text-gray-900 focus:border-[#020e7c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#020e7c]/15 sm:h-14 sm:w-12"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        ))}
      </div>

      <div className="mt-6 text-center text-sm">
        {resendCooldown > 0 ? (
          <p className="text-gray-500">Resend available in {resendCooldown}s</p>
        ) : (
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={isResending}
            className="font-semibold text-[#020e7c] underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Resending…
              </span>
            ) : (
              "Resend email"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerificationInput;
