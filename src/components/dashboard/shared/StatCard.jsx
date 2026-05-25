export function StatCard({ label, value, hint, accent = "blue" }) {
  const accents = {
    blue: "bg-blue-50 text-[#020e7c] border-blue-100",
    green: "bg-emerald-50 text-emerald-800 border-emerald-100",
    amber: "bg-amber-50 text-amber-900 border-amber-100",
    slate: "bg-slate-50 text-slate-800 border-slate-200",
  };

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md ${accents[accent] || accents.blue}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs opacity-80">{hint}</p>}
    </div>
  );
}

export default StatCard;
