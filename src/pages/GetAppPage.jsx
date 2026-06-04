import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy } from "lucide-react";
import { toast } from "react-toastify";
import InstallAppSection from "../components/install/InstallAppSection";
import { copyInstallLink, isIOSDevice } from "../utils/installApp";



export default function GetAppPage() {
  const onIos = isIOSDevice();
  const [copied, setCopied] = useState(false);

  const handleCopyInstallLink = async () => {
    try {
      await copyInstallLink();
      setCopied(true);
      toast.success("Install link copied.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy. Try again or copy the URL from the box below.");
    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 px-4 py-10">

      <div className="mx-auto max-w-lg space-y-6">

        <Link to="/" className="text-sm font-medium text-[#020e7c] hover:underline">

          ← Back to MedFair

        </Link>

        <div className="text-center">

          <img src="/logo.png" alt="MedFair" className="mx-auto h-16 w-auto" />

          <h1 className="mt-4 text-2xl font-bold text-[#020e7c]">Get the MedFair app</h1>

          <p className="mt-2 text-sm text-slate-600">

            Install options always show here, whether or not you already use MedFair on this phone.

          </p>

        </div>

        <button
          type="button"
          onClick={handleCopyInstallLink}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-[#020e7c] bg-[#020e7c] text-sm font-bold text-white shadow-md hover:bg-blue-900"
        >
          {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          {copied ? "Link copied!" : "Copy install link"}
        </button>

        <InstallAppSection alwaysShow variant="hero" />

        {!onIos && (

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">

            <p className="font-semibold text-slate-800">Android (Chrome)</p>

            <p className="mt-1">Tap menu, then Install app or Add to Home screen.</p>

          </div>

        )}

        <Link

          to="/login"

          className="block w-full rounded-xl bg-[#020e7c] py-3 text-center text-sm font-semibold text-white"

        >

          Already installed? Sign in

        </Link>

      </div>

    </div>

  );

}

