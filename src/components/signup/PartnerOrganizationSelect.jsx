import { useEffect, useState } from "react";
import { Building2, Loader2 } from "lucide-react";
import {
  fetchPartnerOrganizations,
  findPartnerBySlug,
} from "../../utils/partnerOrganizations";

const DIRECT_MEDFAIR_VALUE = "";

export default function PartnerOrganizationSelect({
  value = "",
  onChange,
  lockedSlug = null,
  required = false,
  fieldClass,
  className = "",
}) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const boxClass =
    fieldClass ||
    "h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 text-sm text-gray-900 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");

    fetchPartnerOrganizations()
      .then((list) => {
        if (!cancelled) setPartners(list);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err?.message || "Could not load hospitals.");
          setPartners([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const locked = Boolean(lockedSlug?.trim());
  const selected = findPartnerBySlug(partners, value || lockedSlug);
  const selectValue = locked ? lockedSlug : value || DIRECT_MEDFAIR_VALUE;

  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor="partnerSlug"
        className="text-sm font-semibold text-gray-700 flex items-center gap-2"
      >
        <Building2 className="h-4 w-4 text-violet-600 shrink-0" />
        <span>
          Hospital or Partner
          {required ? <span className="text-red-500"> *</span> : null}
        </span>
      </label>

      {loading ? (
        <div
          className={`${boxClass} flex items-center gap-2 text-gray-600`}
          aria-busy="true"
        >
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          <span>Loading hospitals…</span>
        </div>
      ) : (
        <select
          id="partnerSlug"
          name="partnerSlug"
          value={selectValue}
          disabled={locked}
          required={required && partners.length > 0}
          onChange={(e) => onChange?.(e.target.value)}
          className={boxClass}
        >
          <option value={DIRECT_MEDFAIR_VALUE}>Medfair direct (no partner)</option>
          {partners.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      )}

      {loadError ? (
        <p className="text-xs text-amber-700">
          {loadError} You can still continue with Medfair direct.
        </p>
      ) : null}

      {locked && selected ? (
        <p className="text-xs text-blue-800">
          Registering via <strong>{selected.name}</strong> (from your invite link).
        </p>
      ) : null}
    </div>
  );
}
