import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import RouteErrorBoundary from "./components/common/RouteErrorBoundary";
import AppNotificationPrompt from "./components/common/AppNotificationPrompt";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-gray-50 to-slate-100">
      <AppNotificationPrompt />
      <Sidebar />
      <main className="min-h-screen flex-1 overflow-y-auto lg:pl-[260px]">
        <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
          <RouteErrorBoundary>
            <Outlet />
          </RouteErrorBoundary>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
