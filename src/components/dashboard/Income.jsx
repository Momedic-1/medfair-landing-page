import axios from "axios";
import { useState, useEffect } from "react";
import { Loader2, Wallet, Mail, X } from "lucide-react";
import { baseUrl } from "../../env.jsx";
import { formatNumber, getId, getToken } from "../../utils.jsx";

function Income({ compact = false }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const id = getId();
        const token = getToken();

        if (!id || !token) {
          setError("Sign in to view balance.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${baseUrl}/api/earnings/summary/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setBalance(response.data?.currentBalance ?? 0);
      } catch {
        setError("Could not load balance.");
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white py-10 text-sm text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin text-[#020e7c]" />
        Loading wallet…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <>
      <div
        className={`overflow-hidden rounded-2xl border border-[#020e7c]/10 bg-gradient-to-br from-[#020e7c]/8 via-white to-blue-50 shadow-sm ${
          compact ? "p-4" : "p-6"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#020e7c]/10 text-[#020e7c]">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Available balance
        </p>
        <p
          className={`mt-1 font-bold tabular-nums text-[#020e7c] ${
            compact ? "text-2xl" : "text-3xl"
          }`}
        >
          ₦{formatNumber(balance)}
        </p>
        {!compact && (
          <p className="mt-2 text-sm text-gray-600">
            Amount ready for withdrawal from your consultation earnings.
          </p>
        )}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={`mt-4 w-full rounded-xl bg-[#020e7c] text-sm font-semibold text-white transition hover:bg-[#0a1a8f] ${
            compact ? "py-2.5" : "py-3"
          }`}
        >
          Request withdrawal
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#020e7c]/10 text-[#020e7c]">
                <Mail className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-gray-900">
              Withdrawal request
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Email{" "}
              <a
                href="mailto:medfairfinance@gmail.com"
                className="font-semibold text-[#020e7c]"
              >
                medfairfinance@gmail.com
              </a>{" "}
              with your account email and amount.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-5 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Income;
