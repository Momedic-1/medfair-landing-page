import { useState } from "react";

const clampHour = (val) => {
  const n = parseInt(val, 10);
  if (Number.isNaN(n)) return 12;
  return Math.min(12, Math.max(1, n));
};

const clampMinute = (val) => {
  const n = parseInt(val, 10);
  if (Number.isNaN(n)) return 0;
  return Math.min(59, Math.max(0, n));
};

const Modal = ({ isOpen, onClose, onConfirm }) => {
  const [time, setTime] = useState({
    hours: "12",
    minutes: "00",
    amPm: "PM",
  });

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      hours: String(clampHour(time.hours)).padStart(2, "0"),
      minutes: String(clampMinute(time.minutes)).padStart(2, "0"),
      amPm: time.amPm,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-center text-lg font-semibold text-[#020e7c]">
          Set time for appointment
        </h3>

        <div className="mb-4 grid grid-cols-2 gap-2">
          {["AM", "PM"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setTime((t) => ({ ...t, amPm: p }))}
              className={`rounded-lg py-2.5 text-sm font-semibold ${
                time.amPm === p
                  ? "bg-[#020e7c] text-white"
                  : "border border-gray-200 text-gray-700 hover:bg-blue-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-end justify-center gap-3">
          <div className="flex flex-col items-center">
            <label className="mb-1 text-xs font-medium text-gray-600">Hour</label>
            <input
              type="number"
              value={time.hours}
              onChange={(e) =>
                setTime((t) => ({ ...t, hours: e.target.value }))
              }
              onBlur={(e) =>
                setTime((t) => ({
                  ...t,
                  hours: String(clampHour(e.target.value)),
                }))
              }
              className="w-16 rounded-lg border border-gray-200 p-2 text-center text-xl"
              min={1}
              max={12}
            />
          </div>
          <span className="pb-2 text-2xl font-semibold text-gray-400">:</span>
          <div className="flex flex-col items-center">
            <label className="mb-1 text-xs font-medium text-gray-600">
              Minute
            </label>
            <input
              type="number"
              value={time.minutes}
              onChange={(e) =>
                setTime((t) => ({ ...t, minutes: e.target.value }))
              }
              onBlur={(e) =>
                setTime((t) => ({
                  ...t,
                  minutes: String(clampMinute(e.target.value)).padStart(2, "0"),
                }))
              }
              className="w-16 rounded-lg border border-gray-200 p-2 text-center text-xl"
              min={0}
              max={59}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className="mt-6 w-full rounded-lg bg-[#020e7c] py-2.5 font-semibold text-white hover:bg-blue-800"
        >
          Set time
        </button>
      </div>
    </div>
  );
};

export default Modal;
