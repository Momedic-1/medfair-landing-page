import { Moon, Sun } from "lucide-react";

function DarkModeToggle({ isDarkMode, onToggle, className = "" }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 ${className}`}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}

export default DarkModeToggle;

