import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import DesignedSideBar from "../components/reuseables/DesignedSideBar";

const VerificationSuccessful = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/login"), 1500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[380px_1fr]">
      <DesignedSideBar className="hidden lg:flex lg:min-h-screen" />
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-blue-50/40 px-4 py-8 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#020e7c]/70">
            All set
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#020e7c]">
            Email verified
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Your account is ready. Taking you to sign in…
          </p>
          <Link
            to="/login"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#020e7c] text-sm font-semibold text-white hover:bg-[#010a5c]"
          >
            Continue to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerificationSuccessful;
