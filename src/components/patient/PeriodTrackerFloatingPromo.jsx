import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarHeart, X } from "lucide-react";

const DISMISS_KEY = "medfair_period_tracker_promo_dismissed";

export default function PeriodTrackerFloatingPromo() {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 16, y: 120 });
  const dir = useRef({ dx: 1.2, dy: 0.9 });
  const boxRef = useRef(null);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === "true") return;
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return undefined;

    const tick = () => {
      setPos((p) => {
        const maxX = Math.max(8, window.innerWidth - 280);
        const maxY = Math.max(80, window.innerHeight - 100);
        let nx = p.x + dir.current.dx;
        let ny = p.y + dir.current.dy;
        if (nx <= 8 || nx >= maxX) dir.current.dx *= -1;
        if (ny <= 80 || ny >= maxY) dir.current.dy *= -1;
        return {
          x: Math.min(maxX, Math.max(8, nx)),
          y: Math.min(maxY, Math.max(80, ny)),
        };
      });
    };

    const id = setInterval(tick, 40);
    return () => clearInterval(id);
  }, [visible]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      ref={boxRef}
      className="fixed z-[90] w-[260px] animate-pulse rounded-2xl border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-white p-4 shadow-lg ring-2 ring-pink-200/60 sm:w-[280px]"
      style={{ left: pos.x, top: pos.y }}
      role="complementary"
      aria-label="Period tracker promotion"
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-white shadow"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500 text-white">
          <CalendarHeart className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#020e7c]">Period Tracker</p>
          <p className="mt-0.5 text-xs text-slate-600">
            Track cycles, fertile days & reminders. Tap to open.
          </p>
        </div>
      </div>
      <Link
        to="/patient-dashboard/period-tracker"
        onClick={dismiss}
        className="mt-3 block w-full rounded-lg bg-[#020e7c] py-2 text-center text-xs font-semibold text-white"
      >
        Open Period Tracker
      </Link>
    </div>
  );
}
