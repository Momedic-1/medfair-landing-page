import { X } from "lucide-react";
import InstallIosGuide from "./InstallIosGuide";
import { isIOSDevice } from "../../utils/installApp";

export default function InstallGuideModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-guide-title"
    >
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-slate-50 p-4 shadow-2xl sm:p-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 hover:bg-slate-200"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 id="install-guide-title" className="pr-10 text-lg font-bold text-[#020e7c]">
          {isIOSDevice() ? "Add MedFair to your iPhone" : "Install MedFair"}
        </h2>
        {isIOSDevice() ? (
          <div className="mt-3">
            <InstallIosGuide compact />
          </div>
        ) : (
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p>
              <strong>Android (Chrome):</strong> Tap the menu (⋮) then{" "}
              <strong>Install app</strong> or <strong>Add to Home screen</strong>.
            </p>
            <p>
              <strong>Desktop Chrome:</strong> Click the install icon in the address bar, or use
              menu → Install MedFair.
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-[#020e7c] py-3 text-sm font-semibold text-white"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
