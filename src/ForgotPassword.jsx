import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import DesignedSideBar from "./components/reuseables/DesignedSideBar";
import { baseUrl } from "./env";

export default function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${baseUrl}/api/v1/registration/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        navigate("/otp-verification", {
          state: {
            email: formData.email,
            newPassword: formData.newPassword,
          },
        });
      } else {
        setError(data.exceptionMessage || data.message || "Failed to start password reset");
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "block w-full h-11 rounded-xl border border-gray-200 bg-gray-50/80 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#020e7c] focus:bg-white focus:ring-2 focus:ring-[#020e7c]/15";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5";

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[380px_1fr]">
      <DesignedSideBar className="hidden lg:flex lg:min-h-screen" />
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-blue-50/40 px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 rounded-2xl border border-blue-100 bg-white/80 p-4 text-center shadow-sm backdrop-blur lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#020e7c]/70">
              Medfair
            </p>
            <p className="mt-1 text-sm text-gray-600">Reset your password securely.</p>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#020e7c]/70">
              Account recovery
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#020e7c] sm:text-3xl">
              Reset password
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email and a new password. We will send a verification code next.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8"
          >
            {error ? (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="mb-5">
              <label className={labelClass} htmlFor="email">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="you@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div className="mb-6">
              <label className={labelClass} htmlFor="newPassword">
                New password
              </label>
              <div className="relative">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  name="newPassword"
                  id="newPassword"
                  placeholder="At least 8 characters"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-[#020e7c]"
                  aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                >
                  {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#020e7c] text-sm font-semibold text-white hover:bg-[#010a5c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending code…
                </>
              ) : (
                "Continue"
              )}
            </button>

            <p className="mt-6 text-center text-sm text-gray-500">
              Remembered it?{" "}
              <Link to="/login" className="font-semibold text-[#020e7c] hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
