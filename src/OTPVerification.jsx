import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import DesignedSideBar from "./components/reuseables/DesignedSideBar";
import { baseUrl } from "./env";

export default function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const inputRefs = useRef([]);
  const submittingRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate("/forgot-password");
    }
  }, [location, navigate]);

  const handleSubmit = async (codeDigits = otp) => {
    if (submittingRef.current) return;
    const token = codeDigits.join("");
    if (token.length !== 5) return;

    submittingRef.current = true;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${baseUrl}/api/v1/registration/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });

      const responseText = await response.text();

      if (responseText.includes("Email verification successful")) {
        const resetResponse = await fetch(`${baseUrl}/api/v1/registration/password/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            newPassword: location.state?.newPassword,
          }),
        });

        if (resetResponse.ok) {
          navigate("/login", {
            state: { successMessage: "Password reset successful. You can sign in now." },
          });
        } else {
          const resetData = await resetResponse.json().catch(() => ({}));
          setError(resetData.exceptionMessage || resetData.message || "Failed to reset password");
        }
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch {
      setError("Something went wrong while verifying the code.");
    } finally {
      setIsLoading(false);
      submittingRef.current = false;
    }
  };

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== "") && newOtp.join("").length === 5) {
      handleSubmit(newOtp);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    if (!pasted) return;
    const next = ["", "", "", "", ""];
    for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i];
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 4)]?.focus();
    if (pasted.length === 5) handleSubmit(next);
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[380px_1fr]">
      <DesignedSideBar className="hidden lg:flex lg:min-h-screen" />
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-blue-50/40 px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#020e7c]/70">
              Verification
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#020e7c] sm:text-3xl">
              Enter your code
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              We sent a 5-digit code to{" "}
              <span className="font-semibold text-gray-900">{email || "your email"}</span>.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8">
            {error ? (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  disabled={isLoading}
                  className="h-12 w-11 rounded-xl border border-gray-200 bg-gray-50/80 text-center text-lg font-semibold text-gray-900 focus:border-[#020e7c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#020e7c]/15 sm:h-14 sm:w-12"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isLoading || otp.some((d) => d === "")}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#020e7c] text-sm font-semibold text-white hover:bg-[#010a5c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify and reset"
              )}
            </button>

            <p className="mt-6 text-center text-sm text-gray-500">
              <Link to="/forgot-password" className="font-semibold text-[#020e7c] hover:underline">
                Back
              </Link>
              {" · "}
              <Link to="/login" className="font-semibold text-[#020e7c] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
