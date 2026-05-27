import { Link } from "react-router-dom";
import { UserCircle, Wifi, WifiOff } from "lucide-react";
import DoctorImg from "../../assets/doctor.png";

function DoctorDashboardHeader({
  userData,
  status,
  onStatusToggle,
  profileComplete,
  profileLoading,
  themeToggle,
}) {
  const firstName = userData?.firstName
    ? userData.firstName.charAt(0).toUpperCase() +
      userData.firstName.slice(1).toLowerCase()
    : "Doctor";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const isOnline = status === "Online";

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="flex flex-col md:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-4 p-5 sm:p-6 md:p-8">
          <p className="text-sm font-medium text-blue-600">{greeting}</p>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#020e7c] sm:text-3xl">
              Dr. {firstName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage appointments, join consultations, and respond to patients.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {themeToggle}
            <button
              type="button"
              onClick={onStatusToggle}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                isOnline
                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              {isOnline ? "Online" : "Offline"}
            </button>
            {!profileLoading && (
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  profileComplete
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-800"
                }`}
              >
                {profileComplete ? "Profile complete" : "Profile incomplete"}
              </span>
            )}
            <Link
              to="/doctor-dashboard/edit-profile"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#020e7c]/20 bg-[#020e7c]/5 px-3 py-1.5 text-xs font-semibold text-[#020e7c] hover:bg-[#020e7c]/10"
            >
              <UserCircle size={14} />
              Edit profile
            </Link>
          </div>
        </div>
        <div className="relative h-44 w-full md:h-auto md:w-72 lg:w-80">
          <img
            src={DoctorImg}
            alt=""
            className="h-full w-full object-cover md:rounded-l-none"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020e7c]/20 to-transparent md:bg-gradient-to-l" />
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboardHeader;
