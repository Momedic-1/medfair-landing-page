import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { CalendarHeart, X } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPeriodDate } from "../../utils/periodInsights";

export default function PeriodReminderModal({ open, onClose, insights }) {
  if (!insights) return null;

  const { nextPeriod, fertileStart, fertileEnd, daysUntilNext } = insights;
  const headline =
    daysUntilNext === 0
      ? "Your period may start today"
      : daysUntilNext === 1
        ? "Your period may start tomorrow"
        : `Your period may start in ${daysUntilNext} days`;

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto p-4">
          <div className="flex min-h-full items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-500 text-white">
                      <CalendarHeart className="h-5 w-5" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-bold text-[#020e7c]">
                        Period reminder
                      </Dialog.Title>
                      <p className="mt-0.5 text-sm text-gray-600">{headline}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 space-y-2 rounded-xl bg-pink-50/80 p-4 text-sm text-gray-700">
                  <p>
                    Next expected period:{" "}
                    <span className="font-semibold">{formatPeriodDate(nextPeriod)}</span>
                  </p>
                  <p>
                    Estimated fertile window:{" "}
                    <span className="font-semibold">
                      {formatPeriodDate(fertileStart)} – {formatPeriodDate(fertileEnd)}
                    </span>
                  </p>
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  You will also receive email reminders if you enabled them in Period Tracker.
                </p>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Got it
                  </button>
                  <Link
                    to="/patient-dashboard/period-tracker"
                    onClick={onClose}
                    className="rounded-lg bg-[#020e7c] px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-900"
                  >
                    Open Period Tracker
                  </Link>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
