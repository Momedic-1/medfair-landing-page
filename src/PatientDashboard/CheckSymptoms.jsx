import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Phone, Sparkles, Thermometer } from "lucide-react";
import { baseUrl } from "../env";
import { getId, getToken } from "../utils";
import { parseApiError } from "../utils/parseApiError";

const URGENCY_HINTS = [
  "Chest pain or pressure",
  "Trouble breathing",
  "Sudden weakness on one side",
  "Heavy bleeding",
  "Hard to wake or confusion",
];

export default function CheckSymptoms() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [mainSymptom, setMainSymptom] = useState(initialQ);
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const resultTone = useMemo(() => {
    if (!result) return "bg-[#020e7c]/5 text-[#020e7c]";
    if (result.emergency || result.urgency === "EMERGENCY") {
      return "bg-red-50 text-red-800 border border-red-200";
    }
    if (result.urgency === "SEE_DOCTOR_TODAY") {
      return "bg-amber-50 text-amber-900 border border-amber-200";
    }
    return "bg-[#020e7c]/5 text-[#020e7c]";
  }, [result]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!mainSymptom.trim()) return;

    const patientId = getId();
    const token = getToken();
    if (!patientId || !token) {
      setError("Please sign in again.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await axios.post(
        `${baseUrl}/api/wellness/symptoms/check/${patientId}`,
        {
          mainSymptom: mainSymptom.trim(),
          duration: duration.trim() || null,
          severity,
          notes: notes.trim() || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setResult(res.data);
    } catch (err) {
      setError(parseApiError(err, "Could not analyze symptoms right now."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl pb-10">
      <button
        type="button"
        onClick={() => navigate("/patient-dashboard")}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#020e7c] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </button>

      <section className="mb-5 overflow-hidden rounded-2xl bg-[#020e7c] px-5 py-5 text-white shadow-md">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Thermometer className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-200">
              Symptom check
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              Check symptoms
            </h1>
            <p className="mt-1 text-sm text-blue-100/90">
              Guidance to prepare for your consult, not a diagnosis.
            </p>
          </div>
        </div>
      </section>

      <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-950">
        <p className="font-semibold">If this is an emergency, get help now</p>
        <ul className="mt-2 space-y-1 text-xs text-amber-900/90">
          {URGENCY_HINTS.map((h) => (
            <li key={h} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-700" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      {!result ? (
        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6"
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[#020e7c]">
              Main symptom
            </span>
            <textarea
              value={mainSymptom}
              onChange={(e) => setMainSymptom(e.target.value)}
              rows={3}
              placeholder="Example: Headache and mild fever since yesterday"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#020e7c] focus:bg-white focus:ring-2 focus:ring-[#020e7c]/15"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[#020e7c]">
              How long?
            </span>
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Example: 2 days"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#020e7c] focus:bg-white focus:ring-2 focus:ring-[#020e7c]/15"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-sm font-semibold text-[#020e7c]">
              How bad is it?
              <span className="rounded-lg bg-[#020e7c]/10 px-2 py-0.5 text-xs font-bold">
                {severity} of 10
              </span>
            </span>
            <input
              type="range"
              min={1}
              max={10}
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="mt-2 w-full accent-[#020e7c]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-[#020e7c]">
              Anything else? (optional)
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="What makes it better or worse?"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#020e7c] focus:bg-white focus:ring-2 focus:ring-[#020e7c]/15"
            />
          </label>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#020e7c] px-4 py-3.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:opacity-70"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Analyzing…" : "Analyze symptoms"}
          </button>
          <p className="text-center text-[11px] text-slate-400">
            Uses your profile context on the server. Guidance only.
          </p>
        </form>
      ) : (
        <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6">
          <div className={`rounded-2xl px-4 py-4 ${resultTone}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
              Suggested next step
            </p>
            <p className="mt-1 text-xl font-bold">
              {result.urgencyLabel || "Review with a doctor"}
            </p>
            <p className="mt-2 text-sm opacity-90">{result.summary}</p>
          </div>

          {Array.isArray(result.considerations) &&
            result.considerations.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[#020e7c]">
                  Possible considerations
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                  {result.considerations.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#020e7c]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {Array.isArray(result.questionsForDoctor) &&
            result.questionsForDoctor.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[#020e7c]">
                  Tell your doctor
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                  {result.questionsForDoctor.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          <p className="text-sm leading-relaxed text-slate-600">
            {result.disclaimer ||
              "This is guidance only. A Medfair doctor should confirm what is going on."}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#020e7c] px-4 py-3 text-sm font-semibold text-white hover:bg-blue-900"
              onClick={() =>
                navigate("/patient-dashboard", { state: { openCallGp: true } })
              }
            >
              <Phone className="h-4 w-4" />
              Call a GP
            </button>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setError("");
              }}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#020e7c] hover:bg-slate-50"
            >
              Edit symptoms
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
