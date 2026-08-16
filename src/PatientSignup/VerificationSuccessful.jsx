import { CheckCircle2 } from "lucide-react";

const VerificationSuccessful = () => {
  return (
    <div className="flex items-center justify-center py-4">
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
          Your Medfair account is ready. Taking you to sign in…
        </p>
      </div>
    </div>
  );
};

export default VerificationSuccessful;
