import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowDownToLine,
  Mail,
  TrendingUp,
  Wallet,
  X,
  Loader2,
  PiggyBank,
} from "lucide-react";
import { baseUrl } from "../env";
import { formatNumber, getId, getToken } from "../utils";

const FINANCE_EMAIL = "medfairfinance@gmail.com";

function FinanceStatCard({ icon: Icon, label, value, hint, accent }) {
  const accents = {
    primary:
      "border-[#020e7c]/15 bg-gradient-to-br from-[#020e7c]/5 to-blue-50/80",
    emerald: "border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white",
    slate: "border-slate-200 bg-gradient-to-br from-slate-50 to-white",
  };

  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md ${accents[accent] || accents.primary}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            accent === "emerald"
              ? "bg-emerald-100 text-emerald-700"
              : accent === "slate"
                ? "bg-slate-100 text-slate-600"
                : "bg-[#020e7c]/10 text-[#020e7c]"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-[#020e7c] sm:text-3xl">
        ₦{formatNumber(value ?? 0)}
      </p>
      {hint && <p className="mt-2 text-xs leading-relaxed text-gray-500">{hint}</p>}
    </article>
  );
}

const Finances = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      const id = getId();
      const token = getToken();
      if (!id || !token) {
        setError("Please sign in again to view your earnings.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `${baseUrl}/api/earnings/summary/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSummary(response.data);
      } catch {
        setError("We could not load your finance summary. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const available = summary?.currentBalance ?? 0;
  const totalEarned = summary?.totalEarnings ?? 0;
  const withdrawn = summary?.totalWithdrawals ?? 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
      <header className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#020e7c]/70">
          Doctor dashboard
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[#020e7c] sm:text-3xl">
          Finances
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Track consultation earnings, withdrawals, and request payouts from your
          wallet.
        </p>
      </header>

      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#020e7c]" />
          <p className="text-sm">Loading your finance summary…</p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {!loading && !error && summary && (
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#020e7c] via-[#0c1d8f] to-[#1e40af] p-6 text-white shadow-xl sm:p-8">
            <div
              className="pointer-events-none absolute -right-10 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl"
              aria-hidden
            />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  <Wallet className="h-3.5 w-3.5" />
                  Available to withdraw
                </div>
                <p className="mt-4 text-4xl font-bold tabular-nums tracking-tight sm:text-5xl">
                  ₦{formatNumber(available)}
                </p>
                <p className="mt-2 max-w-md text-sm text-blue-100/90">
                  This is the amount currently in your wallet. Withdrawal requests
                  are processed manually by our finance team.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(true)}
                disabled={available <= 0}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-[#020e7c] shadow-lg transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Request withdrawal
              </button>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FinanceStatCard
              icon={TrendingUp}
              label="Total earned"
              value={totalEarned}
              hint="Lifetime earnings from completed consultations on Medfair."
              accent="primary"
            />
            <FinanceStatCard
              icon={PiggyBank}
              label="Total withdrawn"
              value={withdrawn}
              hint="Cumulative amount already paid out to your account."
              accent="emerald"
            />
            <FinanceStatCard
              icon={Wallet}
              label="In wallet"
              value={available}
              hint="Ready for your next withdrawal request."
              accent="slate"
            />
          </div>

          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-semibold text-[#020e7c]">
              How withdrawals work
            </h2>
            <ol className="mt-4 space-y-3 text-sm text-gray-600">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#020e7c]/10 text-xs font-bold text-[#020e7c]">
                  1
                </span>
                <span>
                  Tap <strong className="text-gray-800">Request withdrawal</strong>{" "}
                  when you are ready to cash out.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#020e7c]/10 text-xs font-bold text-[#020e7c]">
                  2
                </span>
                <span>
                  Email{" "}
                  <a
                    href={`mailto:${FINANCE_EMAIL}`}
                    className="font-medium text-[#020e7c] underline-offset-2 hover:underline"
                  >
                    {FINANCE_EMAIL}
                  </a>{" "}
                  with your registered email and the amount to withdraw.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#020e7c]/10 text-xs font-bold text-[#020e7c]">
                  3
                </span>
                <span>
                  Our team will confirm and process your payout within standard
                  processing times.
                </span>
              </li>
            </ol>
          </section>
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-labelledby="withdraw-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#020e7c]/10 text-[#020e7c]">
                <Mail className="h-6 w-6" />
              </div>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <h2
              id="withdraw-title"
              className="mt-4 text-xl font-semibold text-gray-900"
            >
              Request a withdrawal
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Send an email to our finance team with your Medfair account email
              and the amount you wish to withdraw (up to{" "}
              <strong className="text-[#020e7c]">
                ₦{formatNumber(available)}
              </strong>
              ).
            </p>
            <a
              href={`mailto:${FINANCE_EMAIL}?subject=Medfair%20withdrawal%20request&body=Please%20process%20my%20withdrawal.%20Registered%20email%3A%20%0AAmount%3A%20%E2%82%A6`}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#020e7c] py-3 text-sm font-semibold text-white hover:bg-[#0a1a8f]"
            >
              <Mail className="h-4 w-4" />
              Email finance team
            </a>
            <button
              type="button"
              onClick={() => setShowWithdrawModal(false)}
              className="mt-3 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finances;
