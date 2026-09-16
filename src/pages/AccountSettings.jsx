import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { Lock, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { baseUrl } from "../env";
import { getToken } from "../utils";
import { logout } from "../features/authSlice";

export default function AccountSettings() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = getToken();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [confirmText, setConfirmText] = useState("");
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const forceLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Fill in all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      await axios.post(
        `${baseUrl}/api/account/change-password`,
        {
          oldPassword: currentPassword,
          newPassword,
        },
        { headers: authHeaders }
      );
      toast.success("Password changed. Please sign in again.");
      forceLogout();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.data ||
        err?.message ||
        "Could not change password.";
      toast.error(typeof message === "string" ? message : "Could not change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (confirmText.trim().toUpperCase() !== "DEACTIVATE") {
      toast.error('Type DEACTIVATE to confirm.');
      return;
    }
    setDeactivateLoading(true);
    try {
      await axios.post(
        `${baseUrl}/api/account/deactivate`,
        {},
        { headers: authHeaders }
      );
      toast.success("Your account has been deactivated.");
      forceLogout();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.data ||
        err?.message ||
        "Could not deactivate account.";
      toast.error(typeof message === "string" ? message : "Could not deactivate account.");
    } finally {
      setDeactivateLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#020E7C]">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Change your password or deactivate your account.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-[#020E7C]" />
          <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Current password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#020E7C]"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#020E7C]"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Confirm new password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#020E7C]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="inline-flex items-center justify-center rounded-lg bg-[#020E7C] px-4 py-2 text-sm font-medium text-white hover:bg-[#03129a] disabled:opacity-60"
          >
            {passwordLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Update password"
            )}
          </button>
          <p className="text-xs text-slate-500">
            After a successful change you will be signed out and must log in again.
          </p>
        </form>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50/40 p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-semibold text-red-800">Deactivate account</h2>
        </div>
        <p className="mb-3 text-sm text-slate-700">
          Your account will be disabled so you cannot log in again. Doctors also
          stop receiving incoming-call emails. An admin can re-enable the account
          later if needed.
        </p>
        <p className="mb-4 flex items-start gap-2 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          You cannot deactivate while you have an upcoming appointment.
        </p>

        {!showDeactivate ? (
          <button
            type="button"
            onClick={() => setShowDeactivate(true)}
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Deactivate my account
          </button>
        ) : (
          <div className="space-y-3 rounded-xl border border-red-200 bg-white p-4">
            <label className="block text-sm font-medium text-slate-700">
              Type <span className="font-bold">DEACTIVATE</span> to confirm
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DEACTIVATE"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={deactivateLoading}
                onClick={handleDeactivate}
                className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deactivateLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deactivating…
                  </>
                ) : (
                  "Confirm deactivate"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeactivate(false);
                  setConfirmText("");
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
