import { useEffect } from "react";
import { Mail } from "lucide-react";

const CheckEmail = ({ onAnimationComplete, email }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <div className="flex items-center justify-center py-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-lg sm:p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#020e7c]/10 text-[#020e7c]">
          <Mail className="h-7 w-7" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#020e7c]/70">
          Almost there
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[#020e7c]">Check your email</h1>
        <p className="mt-3 text-sm text-gray-600">
          We sent a 5-digit code to{" "}
          <span className="font-semibold text-gray-900">{email || "your email"}</span>.
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Check spam or junk if it does not arrive within a minute.
        </p>
        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-[#020e7c]" />
        </div>
        <p className="mt-3 text-xs text-gray-400">Preparing code entry…</p>
      </div>
    </div>
  );
};

export default CheckEmail;
