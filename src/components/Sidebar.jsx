import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import DashboardIcon from "../assets/DashboardIcon.jsx";
import DocumentsIcon from "../assets/DocumentIcon.jsx";
import FinanceIcon from "../assets/FinanceIcon.jsx";
import { FaUser, FaUserEdit } from "react-icons/fa";
import Logout from "../Logout.jsx";
import { capitalizeFirstLetter } from "../utils";
import DarkModeToggle from "./common/DarkModeToggle.jsx";
import { useDashboardTheme } from "../hooks/useDashboardTheme";

const linkClass = ({ isActive }) =>
  `flex items-center gap-x-3.5 rounded-lg py-2.5 px-2.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-white text-[#020e7c]"
      : "text-gray-100 hover:bg-white/15 hover:text-white"
  }`;

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const { isDarkMode, toggleDarkMode } = useDashboardTheme();

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen((open) => !open);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeSidebar();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = userData?.firstName
    ? `${capitalizeFirstLetter(userData.firstName)} ${capitalizeFirstLetter(userData.lastName || "")}`.trim()
    : "Doctor";

  return (
    <>
      <header className="sticky top-0 z-[48] flex h-12 w-full border-b bg-white py-2.5 text-sm md:h-16 lg:ps-[260px]">
        <nav className="flex w-full items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={toggleSidebar}
            className="text-2xl text-[#020e7c] focus:outline-none lg:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="hidden font-bold text-[#020E7C] md:inline">{displayName}</span>
          <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />
        </nav>
      </header>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[59] bg-gray-900/50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden
        />
      )}

      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 start-0 z-[60] w-[260px] border-e border-[#020e7c]/80 bg-[#020e7c] transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="px-4 pt-4 pb-1 lg:hidden">
            <p className="text-sm font-semibold text-white">{displayName}</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 pt-3">
            <ul className="flex flex-col gap-1">
              <li>
                <NavLink to="/doctor-dashboard" end className={linkClass} onClick={closeSidebar}>
                  <DashboardIcon />
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/doctor-dashboard/view-profile"
                  className={linkClass}
                  onClick={closeSidebar}
                >
                  <FaUser className="h-5 w-5 shrink-0" />
                  View profile
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/doctor-dashboard/edit-profile"
                  className={linkClass}
                  onClick={closeSidebar}
                >
                  <FaUserEdit className="h-5 w-5 shrink-0" />
                  Edit profile
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/doctor-dashboard/finances"
                  className={linkClass}
                  onClick={closeSidebar}
                >
                  <FinanceIcon />
                  Finances
                </NavLink>
              </li>
              <li>
                <NavLink to="/doctor-dashboard/notes" className={linkClass} onClick={closeSidebar}>
                  <DocumentsIcon />
                  Notes
                </NavLink>
              </li>
              <li>
                <NavLink to="/doctor-dashboard/chat" className={linkClass} onClick={closeSidebar}>
                  <span className="text-lg leading-none">💬</span>
                  Chat
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/doctor-dashboard/contact-us"
                  className={linkClass}
                  onClick={closeSidebar}
                >
                  <span className="text-lg leading-none">✉</span>
                  Contact us
                </NavLink>
              </li>
              <li className="mt-4 border-t border-white/20 pt-4">
                <NavLink to="/incoming-call" className={linkClass} onClick={closeSidebar}>
                  <span className="text-lg leading-none">📞</span>
                  Incoming calls
                </NavLink>
              </li>
              <li>
                <Logout />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
