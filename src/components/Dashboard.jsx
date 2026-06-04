import { useEffect, useState } from "react";
import LeftPanel from "./dashboard/LeftPanel.jsx";
import { useDashboardTheme } from "../hooks/useDashboardTheme";

const DoctorDashboard = () => {
  const onlineStatus = "onlineStatus";
  const online = localStorage.getItem(onlineStatus);
  const value = online || "Online";
  const [status, setStatus] = useState(value);
  const { isDarkMode } = useDashboardTheme();

  useEffect(() => {
    if (status !== value) {
      window.location.reload();
    }
  }, [status, value]);

  return (
    <div
      className={`min-h-full w-full ${
        isDarkMode
          ? "bg-[#0b1220] dashboard-theme-dark"
          : "bg-gradient-to-b from-slate-100 via-gray-50 to-slate-100 dashboard-theme-light"
      }`}
    >
      <LeftPanel status={status} setStatus={setStatus} />
    </div>
  );
};

export default DoctorDashboard;
