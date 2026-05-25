/** Normalize API / form values for HTML date inputs (YYYY-MM-DD). */
export function normalizeDateOfBirth(raw) {
  if (raw == null || raw === "") return "";

  if (Array.isArray(raw) && raw.length >= 3) {
    const [y, m, d] = raw;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (s.length >= 10 && s.includes("T")) return s.slice(0, 10);

  if (/^\d{2}[/-]\d{2}[/-]\d{4}$/.test(s)) {
    const parts = s.split(/[/-]/);
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const parsed = new Date(s.includes("T") ? s : `${s}T12:00:00`);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return "";
}
