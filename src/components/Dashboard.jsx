import { useEffect, useState } from "react";
import LeftPanel from "./dashboard/LeftPanel.jsx";
import { useNavigate } from "react-router-dom";
import { useDashboardTheme } from "../hooks/useDashboardTheme";

const Dashboard = () => {
  const navigate = useNavigate();
  const onlineStatus = "onlineStatus";
  const online = localStorage.getItem(onlineStatus);
  const value = online ? online : "Online";

  const [status, setStatus] = useState(value);
  const token = JSON.parse(localStorage.getItem("authToken"))?.token;
  const { isDarkMode } = useDashboardTheme();

  if (!token) {
    navigate("/login");
  }

  useEffect(() => {
    if (status !== value) {
      window.location.reload();
    }
  }, [status, value]);

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-slate-100 via-gray-50 to-slate-100 ${isDarkMode ? "dashboard-theme-dark" : "dashboard-theme-light"}`}
    >
      <LeftPanel status={status} setStatus={setStatus} />
    </div>
  );
};

export default Dashboard;
