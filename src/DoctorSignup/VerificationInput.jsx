import React, { useRef, useState, useEffect } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { baseUrl } from "../env.jsx";
import DesignedSideBar from "../components/reuseables/DesignedSideBar";

function parseStoredEmail(raw) {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "string" ? parsed : String(raw);
  } catch {
    return String(raw).replace(/^"|"$/g, "");
  }
}

const VerificationInput = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const inputRefs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "null");
      if (userData?.name) setUserName(userData.name);
    } catch {
      /* ignore */
    }
    setUserEmail(parseStoredEmail(localStorage.getItem("email")));
  }, []);

  async function verifyEmail(token) {
    if (!userEmail) {
      setErrorMessage("Missing email. Go back to signup and try again.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${baseUrl}/api/v1/registration/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email: userEmail }),
      });

      const contentType = response.headers.get("Content-Type");
      let result;
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = await response.text();
      }
      const ok =
        typeof result === "string"
          ? result.toLowerCase().includes("verification successful")
          : Boolean(result?.isSuccessful || result?.message?.toLowerCase?.().includes("success"));

      if (ok || (typeof result === "string" && result.includes("Email verification successful"))) {
        navigate("/verification-success");
      } else {
        setErrorMessage("Incorrect code. Please try again.");
      }
    } catch {
      setErrorMessage("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < 4) {
      inputRefs.current[index + 1]?.focus();
    } else if (digit && index === 4) {
      const token = newCode.join("");
      if (token.length === 5) verifyEmail(token);
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
    const focusAt = Math.min(pasted.length, 4);
    inputRefs.current[focusAt]?.focus();
    if (pasted.length === 5) verifyEmail(pasted);
  };

  const handleResend = async () => {
    if (!userEmail || isResending || resendCooldown > 0) return;
    setIsResending(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${baseUrl}/api/v1/registration/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.exceptionMessage || data.message || "Could not resend code.");
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
    } catch (err) {
      setErrorMessage(err.message || "Could not resend code.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[380px_1fr]">
      <DesignedSideBar className="hidden lg:flex lg:min-h-screen" />
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-blue-50/40 px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#020e7c]/70">
              Verification
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#020e7c] sm:text-3xl">
              Enter your code
              {userName ? `, ${userName}` : ""}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Type the 5-digit code we emailed you to activate your Medfair account.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8">
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#020e7c]" />
              <p className="text-sm text-gray-700">
                Sent to{" "}
                <span className="font-semibold text-gray-900">
                  {userEmail || "your email"}
                </span>
              </p>
            </div>

            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`input-${index}`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  className="h-12 w-11 rounded-xl border border-gray-200 bg-gray-50/80 text-center text-lg font-semibold text-gray-900 focus:border-[#020e7c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#020e7c]/15 sm:h-14 sm:w-12"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  disabled={loading}
                />
              ))}
            </div>

            {loading ? (
              <p className="mt-4 flex items-center justify-center gap-2 text-sm text-[#020e7c]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying…
              </p>
            ) : null}

            {errorMessage ? (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-6 text-center text-sm text-gray-600">
              {resendCooldown > 0 ? (
                <p>Resend available in {resendCooldown}s</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || !userEmail}
                  className="font-semibold text-[#020e7c] underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isResending ? "Sending…" : "Resend verification code"}
                </button>
              )}
            </div>

            <Link
              to="/login"
              className="mt-6 block text-center text-sm font-medium text-gray-500 hover:text-[#020e7c]"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationInput;
