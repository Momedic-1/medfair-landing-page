import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "react-toastify";
import {
  canUseNotifications,
  getNotificationPermission,
  requestNotificationPermission,
} from "../../utils/notificationPermission";

export default function NotificationPermissionPrompt({ open, onClose, onGranted }) {
  const [requesting, setRequesting] = useState(false);
  const permission = getNotificationPermission();

  const handleEnable = async () => {
    setRequesting(true);
    try {
      const result = await requestNotificationPermission();
      if (result === "granted") {
        toast.success("Notifications enabled.");
        onGranted?.();
        onClose();
      } else if (result === "denied") {
        toast.info(
          "Notifications are blocked in your browser settings. Enable them there to receive alerts."
        );
      } else if (result === "unsupported") {
        toast.error("This browser does not support notifications.");
        onClose();
      }
    } finally {
      setRequesting(false);
    }
  };

  if (!canUseNotifications()) return null;

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={() => {}} static>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
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
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#020e7c] text-white">
                      <Bell className="h-5 w-5" />
                    </div>
                    <Dialog.Title className="text-lg font-bold text-[#020e7c]">
                      Enable notifications
                    </Dialog.Title>
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

                <p className="mt-3 text-sm text-gray-600">
                  Allow notifications to receive your daily health tip each morning at 7:00 AM,
                  plus appointment reminders and period alerts. Browsers require your permission —
                  we cannot enable them automatically.
                </p>

                {permission === "denied" && (
                  <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                    Notifications are currently blocked. Open your browser site settings
                    for Medfair and allow notifications, then refresh this page.
                  </p>
                )}

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Not now
                  </button>
                  <button
                    type="button"
                    onClick={handleEnable}
                    disabled={requesting || permission === "denied"}
                    className="rounded-lg bg-[#020e7c] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {requesting ? "Requesting…" : "Allow notifications"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
