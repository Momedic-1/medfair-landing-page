import { useEffect, useState } from "react";
import { Copy, Check, Download, Share2 } from "lucide-react";
import { toast } from "react-toastify";
import InstallGuideModal from "./InstallGuideModal";
import InstallIosGuide from "./InstallIosGuide";
import {
  copyInstallLink,
  getInstallShareUrl,
  isIOSDevice,
  isStandalonePwa,
} from "../../utils/installApp";

/**
 * Install CTA for visitors. Always shown on /get-app.
 */
export default function InstallAppSection({
  variant = "hero",
  alwaysShow = false,
  className = "",
}) {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [copied, setCopied] = useState(false);

  const installUrl =
    typeof window !== "undefined" ? getInstallShareUrl() : "/get-app";

  useEffect(() => {
    setIsStandalone(isStandalonePwa());

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  const handleCopyLink = async () => {
    try {
      await copyInstallLink();
      setCopied(true);
      toast.success("Install link copied. Paste it in a message for friends.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy link. Select and copy the URL manually.");
    }
  };

  const showBlock = alwaysShow || !isStandalone;

  if (!showBlock) {
    return (
      <div
        className={`rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-[#020e7c] ${className}`}
      >
        <p className="font-semibold">Share MedFair with others</p>
        <p className="mt-1 text-slate-600">
          Friends who do not have the app yet can install from your install link.
        </p>
        <button
          type="button"
          onClick={handleCopyLink}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#020e7c] bg-white text-sm font-bold text-[#020e7c] hover:bg-blue-50"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy install link"}
        </button>
      </div>
    );
  }

  const handleInstall = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      await installPromptEvent.userChoice;
      setInstallPromptEvent(null);
      return;
    }
    if (isIOSDevice()) {
      setShowGuide(true);
      return;
    }
    setShowGuide(true);
  };

  const isCompact = variant === "compact";
  const onIos = isIOSDevice();

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        <div
          className={`rounded-2xl border-2 border-[#020e7c] bg-gradient-to-r from-yellow-300 to-amber-200 shadow-lg ${isCompact ? "p-4" : "p-5"}`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#020e7c] text-white">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <p
                  className={`font-extrabold text-[#020e7c] ${isCompact ? "text-sm" : "text-base"}`}
                >
                  Download MedFair App
                </p>
                <p className="mt-0.5 text-xs text-slate-700 sm:text-sm">
                  Install for faster access. Share the install link so others can add MedFair on
                  their phone too.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-[#020e7c] bg-white px-4 text-sm font-bold text-[#020e7c] hover:bg-blue-50"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy install link"}
              </button>
              {onIos ? (
                <button
                  type="button"
                  onClick={() => setShowGuide(true)}
                  className="h-11 rounded-xl bg-[#020e7c] px-5 text-sm font-bold text-white hover:bg-blue-900"
                >
                  Show steps
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleInstall}
                  className="h-11 rounded-xl bg-[#020e7c] px-5 text-sm font-bold text-white hover:bg-blue-900"
                >
                  Install now
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 rounded-xl border border-[#020e7c]/20 bg-white/60 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-1.5 text-xs text-slate-700">
              <Share2 className="h-3.5 w-3.5 shrink-0" />
              <span className="break-all font-mono font-medium">{installUrl}</span>
            </p>
          </div>
        </div>

        {onIos && <InstallIosGuide />}
      </div>

      <InstallGuideModal open={showGuide} onClose={() => setShowGuide(false)} />
    </>
  );
}
