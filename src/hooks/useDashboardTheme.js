import { useEffect, useState } from "react";

const STORAGE_KEY = "dashboardTheme";

export function useDashboardTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, isDarkMode ? "dark" : "light");
    } catch {
      // ignore
    }
    document.body.classList.toggle("app-dark", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return { isDarkMode, toggleDarkMode };
}

