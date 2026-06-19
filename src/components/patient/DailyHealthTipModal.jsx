import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Lightbulb, X } from "lucide-react";

export default function DailyHealthTipModal({ open, onClose, tip }) {
  if (!tip) return null;

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
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-white">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-bold text-[#020e7c]">
                        Good morning — daily health tip
                      </Dialog.Title>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Your tip for today · around 7:00 AM
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-amber-700">
                        {tip.title}
                      </p>
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

                <p className="mt-4 text-sm leading-relaxed text-gray-700">{tip.body}</p>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-5 w-full rounded-lg bg-[#020e7c] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900"
                >
                  Thanks, got it
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
