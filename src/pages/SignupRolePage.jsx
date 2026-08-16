import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import DesignedSideBar from "../components/reuseables/DesignedSideBar";
import SignupRoleSelect, { signupPathForRole } from "../components/signup/SignupRoleSelect";

const fieldClass =
  "h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base font-medium text-[#020e7c] focus:border-[#020e7c] focus:outline-none focus:ring-2 focus:ring-[#020e7c]/20";

export default function SignupRolePage() {
  const [role, setRole] = useState("PATIENT");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleContinue = () => {
    navigate(signupPathForRole(role, searchParams));
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[380px_1fr]">
      <DesignedSideBar className="hidden lg:flex lg:min-h-screen" />
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-blue-50/40 px-4 py-10">
        <div className="mb-6 rounded-2xl border border-blue-100 bg-white/80 p-4 text-center shadow-sm backdrop-blur lg:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#020e7c]/70">
            Medfair
          </p>
          <p className="mt-1 text-sm text-gray-600">Create your account</p>
        </div>
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#020e7c]/70">
            Get started
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#020e7c]">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Choose Patient or Doctor, then tap Continue to open the signup form.
          </p>

          <SignupRoleSelect
            value={role}
            onRoleChange={setRole}
            fieldClass={fieldClass}
            className="mt-6"
            autoNavigate={false}
          />

          <button
            type="button"
            onClick={handleContinue}
            className="mt-6 h-12 w-full rounded-xl bg-[#020e7c] text-sm font-semibold text-white shadow-md hover:bg-[#0a1a8f]"
          >
            {role === "DOCTOR" ? "Continue as doctor" : "Continue as patient"}
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-[#020e7c] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
