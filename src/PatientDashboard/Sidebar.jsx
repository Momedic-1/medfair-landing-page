import { NavLink } from "react-router-dom";
import dashboard from "./assets/dashboard.svg";
import help from "./assets/help-circle.svg";
import profile from "./assets/profile (2).svg";
import subscription from "./assets/subscription.svg";
import { FaUser } from "react-icons/fa";
import Logout from "../Logout";
import CloseIcon from "../assets/CloseIcon";
import DashboardIcon from "../assets/DashboardIcon";
import { CalendarIcon } from "lucide-react";
import DocumentsIcon from "../assets/DocumentIcon";
import FinanceIcon from "../assets/FinanceIcon";
import SettingsIcon from "../assets/SettingsIcon";
import HelpIcon from "../assets/HelpIcon";

function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const role = userData?.role;

  return (
    <div
      className={`fixed lg:static w-full top-0 left-0 h-full bg-[#020E7C] text-white flex flex-col z-20 transform transition-transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      {role === "PATIENT" ? (
        <div className="w-full">
          <div className="w-full p-4 text-2xl font-bold flex justify-between items-center">
            <p>Patient Dashboard</p>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-white text-2xl focus:outline-none"
            >
              ✕
            </button>
          </div>

          <nav className="flex flex-col p-4">
            <NavLink
              to="/patient-dashboard"
              className="flex items-center p-3 m-3 py-2 px-4 rounded bg-white hover:text-[#020E7C]"
              onClick={toggleSidebar}
            >
              <img src={dashboard} />
              <span className="ml-3 text-black">Dashboard</span>
            </NavLink>

            <NavLink
              to="/patient-dashboard/profile"
              className="flex items-center p-3 m-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]"
              onClick={toggleSidebar}
            >
              <img src={profile} />
              <span className="ml-3">View Profile</span>
            </NavLink>

            <NavLink
              to="/help"
              className="flex items-center p-3 m-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]"
              onClick={toggleSidebar}
            >
              <img src={help} alt="Help" />
              <span className="ml-3">Help</span>
            </NavLink>

            <NavLink
              to="/patient-dashboard/subscription"
              className="flex items-center p-3 m-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]"
              onClick={toggleSidebar}
            >
              <img src={subscription} alt="Subscription" />
              <span className="ml-3">Subscriptions</span>
            </NavLink>

            <NavLink
              to="/patient-dashboard/patient-notes"
              className="flex items-center p-3 m-3 py-2 px-4 rounded hover:bg-white hover:text-[#020E7C]"
              onClick={toggleSidebar}
            >
              <FaUser />
              <span className="ml-3">Notes</span>
            </NavLink>

            <NavLink
              to="/logout"
              className="flex items-center p-3 m-3 py-2 px-2 rounded hover:bg-white hover:text-[#020E7C]"
              onClick={toggleSidebar}
            >
              <Logout />
            </NavLink>
          </nav>
        </div>
      ) : (
        <div className="relative flex flex-col h-full max-h-full">
          <div className="px-6 pt-4 flex justify-between items-center">
            <a className="flex items-center space-x-2 text-sm font-semibold">
              <span className="text-white">Doctor&lsquo;s Dashboard</span>
            </a>
            <button
              onClick={toggleSidebar}
              className="lg:hidden mr-4 mb-20 text-white text-2xl focus:outline-none"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300">
            <nav
              className="hs-accordion-group p-3 w-full flex flex-col flex-wrap"
              data-hs-accordion-always-open
            >
              <ul className="flex flex-col space-y-6 mt-6">
                <li className="mb-2">
                  <NavLink
                    to="/doctor-dashboard"
                    onClick={toggleSidebar}
                    className={({ isActive }) =>
                      `flex items-center p-2 rounded-lg ${
                        isActive
                          ? "bg-blue-100 text-blue-800"
                          : "text-gray-100 hover:bg-gray-100"
                      }`
                    }
                  >
                    <DashboardIcon />
                    Dashboard
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/view-profile"
                    onClick={toggleSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-x-3.5 py-2 px-2.5 rounded-lg ${
                        isActive
                          ? "bg-blue-100 text-blue-800"
                          : "text-gray-100 hover:bg-gray-100 hover:text-[#020E7C]"
                      }`
                    }
                  >
                    <CalendarIcon />
                    View Profile
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/doctor-dashboard/documents"
                    onClick={toggleSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-x-3.5 py-2 px-2.5 rounded-lg ${
                        isActive
                          ? "bg-blue-100 text-blue-800"
                          : "text-gray-100 hover:text-[#020E7C] hover:bg-gray-100"
                      }`
                    }
                  >
                    <DocumentsIcon />
                    Documents
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/doctor-dashboard/finances"
                    onClick={toggleSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-x-3.5 py-2 px-2.5 rounded-lg ${
                        isActive
                          ? "bg-blue-100 text-blue-800"
                          : "text-gray-100 hover:text-[#020E7C] hover:bg-gray-100"
                      }`
                    }
                  >
                    <FinanceIcon />
                    Finances
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/doctor-dashboard/settings"
                    onClick={toggleSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-x-3.5 py-2 px-2.5 rounded-lg ${
                        isActive
                          ? "bg-blue-100 text-blue-800"
                          : "text-gray-100 hover:text-[#020E7C] hover:bg-gray-100"
                      }`
                    }
                  >
                    <SettingsIcon />
                    Settings
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/doctor-dashboard/contact-us"
                    onClick={toggleSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-x-3.5 py-2 px-2.5 rounded-lg ${
                        isActive
                          ? "bg-blue-100 text-blue-800"
                          : "text-gray-100 hover:text-[#020E7C] hover:bg-gray-100"
                      }`
                    }
                  >
                    <HelpIcon />
                    Contact Us
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/doctor-dashboard/notes"
                    onClick={toggleSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-x-3.5 py-2 px-2.5 rounded-lg ${
                        isActive
                          ? "bg-blue-100 text-blue-800"
                          : "text-gray-100 hover:text-[#020E7C] hover:bg-gray-100"
                      }`
                    }
                  >
                    <FaUser />
                    Notes
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/logout"
                    onClick={toggleSidebar}
                    className="flex items-center gap-x-3.5 py-2 px-2.5 rounded-lg hover:text-[#020E7C] hover:bg-gray-100"
                  >
                    <Logout />
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
