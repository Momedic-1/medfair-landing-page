import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { baseUrl } from "../env";
import { getId, getToken } from "../utils";
import {
  formatPeriodDate,
  getPeriodInsights,
  shouldShowPeriodReminder,
} from "../utils/periodInsights";
import PeriodReminderModal from "../components/patient/PeriodReminderModal";

const defaultData = {
  lastPeriodDate: "",
  cycleLength: 28,
  periodLength: 5,
  symptoms: [],
  reminderEmail: "",
};

const symptomOptions = ["Cramps", "Headache", "Mood swings", "Bloating", "Fatigue"];

export default function PeriodTracker() {
  const [form, setForm] = useState(defaultData);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const token = getToken();
  const patientId = getId();

  useEffect(() => {
    const loadData = async () => {
      if (!patientId || !token) return;
      setLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/api/wellness/period-tracker/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response?.data || {};
        if (!data.lastPeriodDate) return;
        let accountEmail = "";
        try {
          const userData = JSON.parse(localStorage.getItem("userData") || "null");
          accountEmail = userData?.emailAddress || userData?.email || "";
        } catch {
          /* ignore */
        }
        setForm({
          lastPeriodDate: data.lastPeriodDate || "",
          cycleLength: data.cycleLength || 28,
          periodLength: data.periodLength || 5,
          symptoms: data.symptoms || [],
          reminderEmail: data.reminderEmail || accountEmail || "",
        });
      } catch (error) {
        toast.error("Could not load period tracker.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [patientId, token]);

  const insights = useMemo(
    () =>
      getPeriodInsights({
        lastPeriodDate: form.lastPeriodDate,
        cycleLength: form.cycleLength,
      }),
    [form.lastPeriodDate, form.cycleLength]
  );

  useEffect(() => {
    if (insights && shouldShowPeriodReminder(insights)) {
      setShowReminderPopup(true);
    }
  }, [insights]);

  const handleSave = async () => {
    if (!patientId || !token) {
      toast.error("Please log in again.");
      return;
    }
    try {
      await axios.post(
        `${baseUrl}/api/wellness/period-tracker/${patientId}`,
        {
          lastPeriodDate: form.lastPeriodDate || null,
          cycleLength: Number(form.cycleLength || 28),
          periodLength: Number(form.periodLength || 5),
          symptoms: form.symptoms,
          reminderEmail: form.reminderEmail || null,
          remindersEnabled: true,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Period tracker saved.");
      if (insights && shouldShowPeriodReminder(insights)) {
        setShowReminderPopup(true);
      }
    } catch (error) {
      toast.error("Could not save period tracker.");
    }
  };

  const toggleSymptom = (symptom) => {
    setForm((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const handleEmailReminder = async () => {
    if (!form.reminderEmail || !insights || !patientId || !token) {
      toast.error("Add reminder email and period details first.");
      return;
    }
    setSending(true);
    try {
      await axios.post(
        `${baseUrl}/api/wellness/period-tracker/${patientId}/send-test-reminder`,
        { email: form.reminderEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Reminder email sent.");
      setShowReminderPopup(true);
    } catch (error) {
      toast.error(error.message || "Could not send reminder email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PeriodReminderModal
        open={showReminderPopup}
        onClose={() => setShowReminderPopup(false)}
        insights={insights}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[#020e7c]">Period Tracker</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track cycle dates, get on-screen reminders, and optional email alerts.
        </p>
      </div>
      {loading && <p className="text-sm text-gray-500">Loading period tracker...</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Last period start date
              <input
                type="date"
                value={form.lastPeriodDate}
                onChange={(e) => setForm((p) => ({ ...p, lastPeriodDate: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Cycle length (days)
              <input
                type="number"
                min={20}
                max={40}
                value={form.cycleLength}
                onChange={(e) => setForm((p) => ({ ...p, cycleLength: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Typical period length (days)
              <input
                type="number"
                min={2}
                max={10}
                value={form.periodLength}
                onChange={(e) => setForm((p) => ({ ...p, periodLength: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>

            <div>
              <p className="text-sm font-medium text-gray-700">Common symptoms</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {symptomOptions.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      form.symptoms.includes(symptom)
                        ? "border-[#020e7c] bg-blue-50 text-[#020e7c]"
                        : "border-gray-300 text-gray-600"
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="mt-5 rounded-lg bg-[#020e7c] px-4 py-2 text-sm font-semibold text-white"
          >
            Save tracker
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#020e7c]">Cycle insights</h2>
          {insights ? (
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <p>
                Next expected period:{" "}
                <span className="font-semibold">{formatPeriodDate(insights.nextPeriod)}</span>
              </p>
              <p>
                Estimated fertile window:{" "}
                <span className="font-semibold">
                  {formatPeriodDate(insights.fertileStart)} - {formatPeriodDate(insights.fertileEnd)}
                </span>
              </p>
              {shouldShowPeriodReminder(insights) && (
                <button
                  type="button"
                  onClick={() => setShowReminderPopup(true)}
                  className="mt-2 text-sm font-semibold text-[#020e7c] underline"
                >
                  View period reminder popup
                </button>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">Enter period details to see predictions.</p>
          )}

          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700">Email reminder</h3>
            <p className="mt-1 text-xs text-gray-500">
              Defaults to your account email. You also get an on-screen popup on the dashboard
              when your period is within 3 days.
            </p>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.reminderEmail}
              onChange={(e) => setForm((p) => ({ ...p, reminderEmail: e.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleEmailReminder}
              disabled={sending}
              className="mt-3 rounded-lg border border-[#020e7c] px-4 py-2 text-sm font-semibold text-[#020e7c] disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send reminder email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
