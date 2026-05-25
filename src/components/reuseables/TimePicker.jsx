import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

/** 12-hour clock + period → 24-hour (0–23) for API */
export function to24Hour(hour12, period) {
  const h = parseInt(hour12, 10);
  if (Number.isNaN(h) || h < 1 || h > 12) return 0;
  if (period === "AM") return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}

/** 24-hour → { hour12, period } for display */
export function from24Hour(hour24) {
  const h = parseInt(hour24, 10);
  if (h === 0) return { hour12: 12, period: "AM" };
  if (h < 12) return { hour12: h, period: "AM" };
  if (h === 12) return { hour12: 12, period: "PM" };
  return { hour12: h - 12, period: "PM" };
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

const TimePicker = ({
  selectedHour,
  selectedMinute,
  setSelectedHour,
  setSelectedMinute,
}) => {
  const initial = from24Hour(selectedHour ?? 12);
  const [hour12, setHour12] = useState(initial.hour12);
  const [minute, setMinute] = useState(
    Math.min(55, Math.round((selectedMinute ?? 0) / 5) * 5)
  );
  const [period, setPeriod] = useState(initial.period);

  useEffect(() => {
    const parsed = from24Hour(selectedHour ?? 12);
    setHour12(parsed.hour12);
    setPeriod(parsed.period);
    setMinute(Math.min(55, Math.round((selectedMinute ?? 0) / 5) * 5));
  }, [selectedHour, selectedMinute]);

  const syncToParent = (h12, min, per) => {
    setSelectedHour(to24Hour(h12, per));
    setSelectedMinute(min);
  };

  const handlePeriodChange = (nextPeriod) => {
    setPeriod(nextPeriod);
    syncToParent(hour12, minute, nextPeriod);
  };

  const handleHourChange = (nextHour) => {
    const h = Number(nextHour);
    setHour12(h);
    syncToParent(h, minute, period);
  };

  const handleMinuteChange = (nextMinute) => {
    const m = Number(nextMinute);
    setMinute(m);
    syncToParent(hour12, m, period);
  };

  const displayTime = `${hour12}:${String(minute).padStart(2, "0")} ${period}`;

  return (
    <div className="w-full">
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#020e7c]">
        <Clock className="h-4 w-4 shrink-0" aria-hidden />
        Appointment time
      </label>

      <div
        className="rounded-xl border border-blue-100 bg-gradient-to-br from-slate-50 to-blue-50/80 p-4 shadow-sm"
        role="group"
        aria-label="Choose appointment time"
      >
        <p className="mb-3 text-center text-2xl font-bold tracking-wide text-[#020e7c] tabular-nums">
          {displayTime}
        </p>

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
          1. Morning or afternoon
        </p>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {["AM", "PM"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePeriodChange(p)}
              className={`rounded-lg py-3 text-sm font-semibold transition-all ${
                period === p
                  ? "bg-[#020e7c] text-white shadow-md"
                  : "border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
          2. Hour & minute
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="appt-hour" className="mb-1 block text-xs text-gray-600">
              Hour
            </label>
            <select
              id="appt-hour"
              value={hour12}
              onChange={(e) => handleHourChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {HOURS_12.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="appt-minute" className="mb-1 block text-xs text-gray-600">
              Minute
            </label>
            <select
              id="appt-minute"
              value={minute}
              onChange={(e) => handleMinuteChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {MINUTES.map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimePicker;
