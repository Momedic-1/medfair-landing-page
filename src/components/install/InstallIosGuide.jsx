import { Share2, PlusSquare, Compass } from "lucide-react";
import { isIOSSafari, isIOSDevice } from "../../utils/installApp";

const stepsSafari = [
  {
    icon: Share2,
    title: "Tap Share",
    text: "At the bottom of Safari, tap the Share button (square with an arrow pointing up).",
  },
  {
    icon: PlusSquare,
    title: "Add to Home Screen",
    text: 'Scroll the menu and tap "Add to Home Screen".',
  },
  {
    icon: PlusSquare,
    title: "Confirm",
    text: 'Tap "Add" in the top right. MedFair will appear on your home screen like an app.',
  },
];

export function InstallIosGuide({ compact = false }) {
  const inSafari = isIOSSafari();

  return (
    <div
      className={`rounded-2xl border-2 border-[#020e7c] bg-white ${compact ? "p-4" : "p-5"}`}
    >
      <p className="text-base font-bold text-[#020e7c]">Install on iPhone (Safari)</p>
      {!inSafari && isIOSDevice() && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Open this page in <strong>Safari</strong> (copy the link from Chrome, then paste in
          Safari). iPhone only allows install from Safari.
        </p>
      )}
      <ol className="mt-4 space-y-4">
        {stepsSafari.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#020e7c] text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <Icon className="h-4 w-4 text-[#020e7c]" aria-hidden />
                  {step.title}
                </p>
                <p className="mt-0.5 text-sm text-slate-600">{step.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 flex items-start gap-2 text-xs text-slate-500">
        <Compass className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Tip: After installing, open MedFair from your home screen icon, not from a bookmark in
        the browser.
      </p>
    </div>
  );
}

export default InstallIosGuide;
