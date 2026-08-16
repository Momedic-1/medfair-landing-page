import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
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

const CheckEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  useEffect(() => {
    setEmail(parseStoredEmail(localStorage.getItem("email")));
    // Prefer code entry immediately; keep a short pause only for the CTA copy.
    const timer = setTimeout(() => navigate("/verify-email"), 800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[380px_1fr]">
      <DesignedSideBar className="hidden lg:flex lg:min-h-screen" />
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-blue-50/40 px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#020e7c]/70">
              Almost there
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#020e7c] sm:text-3xl">
              Check your email
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              We sent a 5-digit verification code to finish setting up your account.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#020e7c]/10 text-[#020e7c]">
              <Mail className="h-7 w-7" />
            </div>
            <p className="text-sm text-gray-600">
              Code sent to{" "}
              <span className="font-semibold text-gray-900">
                {email || "your email"}
              </span>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Check spam or junk if you do not see it within a minute.
            </p>
            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-[#020e7c]" />
            </div>
            <p className="mt-3 text-xs text-gray-400">Opening code entry…</p>
            <button
              type="button"
              onClick={() => navigate("/verify-email")}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#020e7c] text-sm font-semibold text-white hover:bg-[#010a5c]"
            >
              Enter code now
            </button>
            <Link
              to="/login"
              className="mt-4 inline-block text-sm font-medium text-[#020e7c] hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;
