import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { baseUrl } from "../env";
import { getId, getToken } from "../utils";

const defaultPlan = {
  currentWeight: "",
  targetWeight: "",
  heightCm: "",
  activityLevel: "moderate",
  weeklyGoalKg: "0.5",
};

export default function WeightLossProgram() {
  const [plan, setPlan] = useState(defaultPlan);
  const [checkins, setCheckins] = useState([]);
  const [newWeight, setNewWeight] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const token = getToken();
  const patientId = getId();

  useEffect(() => {
    const loadData = async () => {
      if (!patientId || !token) return;
      setLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/api/wellness/weight-loss/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response?.data || {};
        if (!data.currentWeight && !data.targetWeight) return;
        setPlan({
          currentWeight: data.currentWeight ?? "",
          targetWeight: data.targetWeight ?? "",
          heightCm: data.heightCm ?? "",
          activityLevel: data.activityLevel || "moderate",
          weeklyGoalKg: data.weeklyGoalKg ?? "0.5",
        });
        setCheckins(
          Array.isArray(data.checkIns)
            ? data.checkIns.map((item) => ({
                date: item.createdAt,
                weight: item.weight,
                note: item.note,
              }))
            : []
        );
      } catch (error) {
        toast.error("Could not load weight-loss data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [patientId, token]);

  const progress = useMemo(() => {
    const start = Number(plan.currentWeight);
    const target = Number(plan.targetWeight);
    const latest = Number(checkins[0]?.weight || start);
    if (!start || !target || start <= target) return { percent: 0, lost: 0, remaining: 0 };
    const totalToLose = start - target;
    const lost = Math.max(0, start - latest);
    const remaining = Math.max(0, latest - target);
    const percent = Math.min(100, Math.round((lost / totalToLose) * 100));
    return { percent, lost, remaining };
  }, [plan, checkins]);

  const bmi = useMemo(() => {
    const weight = Number(checkins[0]?.weight || plan.currentWeight);
    const heightM = Number(plan.heightCm) / 100;
    if (!weight || !heightM) return null;
    return (weight / (heightM * heightM)).toFixed(1);
  }, [plan, checkins]);

  const savePlan = async () => {
    if (!patientId || !token) {
      toast.error("Please log in again.");
      return;
    }
    try {
      const response = await axios.post(
        `${baseUrl}/api/wellness/weight-loss/${patientId}`,
        {
          currentWeight: Number(plan.currentWeight),
          targetWeight: Number(plan.targetWeight),
          heightCm: Number(plan.heightCm),
          activityLevel: plan.activityLevel,
          weeklyGoalKg: Number(plan.weeklyGoalKg),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response?.data || {};
      setCheckins(
        Array.isArray(data.checkIns)
          ? data.checkIns.map((item) => ({
              date: item.createdAt,
              weight: item.weight,
              note: item.note,
            }))
          : []
      );
      toast.success("Weight-loss plan saved.");
    } catch (error) {
      toast.error("Could not save plan.");
    }
  };

  const addCheckin = async () => {
    if (!newWeight) {
      toast.error("Enter your current weight first.");
      return;
    }
    if (!patientId || !token) {
      toast.error("Please log in again.");
      return;
    }
    try {
      const response = await axios.post(
        `${baseUrl}/api/wellness/weight-loss/${patientId}/check-ins`,
        { weight: Number(newWeight), note: note.trim() || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response?.data || {};
      setCheckins(
        Array.isArray(data.checkIns)
          ? data.checkIns.map((item) => ({
              date: item.createdAt,
              weight: item.weight,
              note: item.note,
            }))
          : []
      );
      setNewWeight("");
      setNote("");
      toast.success("Weekly check-in added.");
    } catch (error) {
      toast.error("Could not add check-in.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[#020e7c]">Weight Loss Program</h1>
        <p className="mt-1 text-sm text-gray-600">
          Set goals, log weekly progress, and monitor your journey with backend sync.
        </p>
      </div>
      {loading && <p className="text-sm text-gray-500">Loading weight-loss data...</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#020e7c]">Plan setup</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Current weight (kg)"
              value={plan.currentWeight}
              onChange={(e) => setPlan((p) => ({ ...p, currentWeight: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Target weight (kg)"
              value={plan.targetWeight}
              onChange={(e) => setPlan((p) => ({ ...p, targetWeight: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Height (cm)"
              value={plan.heightCm}
              onChange={(e) => setPlan((p) => ({ ...p, heightCm: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <select
              value={plan.activityLevel}
              onChange={(e) => setPlan((p) => ({ ...p, activityLevel: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="low">Low activity</option>
              <option value="moderate">Moderate activity</option>
              <option value="high">High activity</option>
            </select>
          </div>
          <div className="mt-3">
            <label className="text-sm text-gray-700">Weekly goal (kg)</label>
            <input
              type="number"
              min="0.1"
              max="1.5"
              step="0.1"
              value={plan.weeklyGoalKg}
              onChange={(e) => setPlan((p) => ({ ...p, weeklyGoalKg: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={savePlan}
            className="mt-4 rounded-lg bg-[#020e7c] px-4 py-2 text-sm font-semibold text-white"
          >
            Save plan
          </button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#020e7c]">Progress snapshot</h2>
          <div className="mt-3 h-3 w-full rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-gray-500">Done</p>
              <p className="font-semibold">{progress.percent}%</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-gray-500">Lost</p>
              <p className="font-semibold">{progress.lost.toFixed(1)} kg</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-xs text-gray-500">Remaining</p>
              <p className="font-semibold">{progress.remaining.toFixed(1)} kg</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">Current BMI: {bmi || "-"}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#020e7c]">Weekly check-in</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-[160px_1fr_auto]">
          <input
            type="number"
            placeholder="Weight (kg)"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="Notes (energy, meals, workouts)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={addCheckin}
            className="rounded-lg border border-[#020e7c] px-4 py-2 text-sm font-semibold text-[#020e7c]"
          >
            Add check-in
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {checkins.length === 0 ? (
            <p className="text-sm text-gray-500">No check-ins yet.</p>
          ) : (
            checkins.map((item) => (
              <div
                key={item.date}
                className="flex flex-wrap items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <div className="font-semibold text-gray-800">{item.weight} kg</div>
                <div className="text-gray-600">
                  {new Date(item.date).toLocaleDateString("en-NG")}
                </div>
                <div className="w-full text-xs text-gray-500 md:w-auto">{item.note || "-"}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
