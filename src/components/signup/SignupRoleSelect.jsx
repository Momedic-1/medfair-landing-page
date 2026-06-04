import { useNavigate, useSearchParams } from "react-router-dom";

export const SIGNUP_ROLE_OPTIONS = [
  { value: "PATIENT", label: "Patient — book doctors and get care" },
  { value: "DOCTOR", label: "Doctor — join as a healthcare provider" },
];

export function signupPathForRole(role, searchParams) {
  const suffix = searchParams?.toString() ? `?${searchParams}` : "";
  return role === "DOCTOR" ? `/doctor_signup${suffix}` : `/patient_signup${suffix}`;
}

/**
 * Patient / doctor signup switcher.
 * @param autoNavigate — if true, changing the dropdown navigates immediately (patient/doctor forms).
 */
export default function SignupRoleSelect({
  value = "PATIENT",
  fieldClass,
  className = "",
  onRoleChange,
  autoNavigate = true,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectClass =
    fieldClass ||
    "h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 text-sm font-medium text-[#020e7c] focus:border-[#020e7c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#020e7c]/20";

  const handleChange = (e) => {
    const next = e.target.value;
    onRoleChange?.(next);

    if (autoNavigate) {
      navigate(signupPathForRole(next, searchParams), { replace: true });
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor="signup-role" className="text-sm font-semibold text-gray-700">
        I am signing up as
      </label>
      <select
        id="signup-role"
        value={value}
        onChange={handleChange}
        className={selectClass}
      >
        {SIGNUP_ROLE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
