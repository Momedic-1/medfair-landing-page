import { LiaPhoneVolumeSolid } from "react-icons/lia";
import { X } from "lucide-react";

const variants = {
  info: "border-blue-200 bg-blue-50 text-blue-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-900",
  call: "border-red-300 bg-gradient-to-r from-red-600 to-red-500 text-white",
};

export function DashboardAlert({
  variant = "info",
  title,
  message,
  primaryAction,
  secondaryAction,
  onDismiss,
  icon,
  className = "",
}) {
  const isCall = variant === "call";

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${variants[variant]} ${className}`}
      role="alert"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {icon ? (
          <span className="mt-0.5 shrink-0">{icon}</span>
        ) : isCall ? (
          <LiaPhoneVolumeSolid className="mt-0.5 shrink-0 text-2xl text-yellow-300" />
        ) : null}
        <div className="min-w-0">
          {title && (
            <p className={`font-semibold ${isCall ? "text-white" : ""}`}>{title}</p>
          )}
          {message && (
            <p
              className={`mt-0.5 text-sm ${isCall ? "text-red-50" : "opacity-90"}`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {primaryAction}
        {secondaryAction}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={`rounded-lg p-1.5 ${isCall ? "text-white/80 hover:bg-white/10" : "text-gray-500 hover:bg-black/5"}`}
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

export default DashboardAlert;
