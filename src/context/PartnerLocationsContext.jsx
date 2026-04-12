import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { baseUrl } from "../env";
import { getToken, getUserData } from "../utils";

export const DEFAULT_PARTNER_PHARMACIES = [
  {
    id: "smartpharm",
    name: "SmartPharm",
    partner: "SMARTPHARM",
  },
  {
    id: "degree_360",
    name: "Degree 360 Pharmacy",
    partner: "DEGREE_360",
  },
];

export const DEFAULT_LAB_PARTNERS = [
  { id: "silahealth", name: "Sila Health", partner: "SILAHEALTH" },
  { id: "medfair_lab", name: "MedFair Lab", partner: "MedFair_Lab" },
];

function extractListPayload(json, depth = 0) {
  if (depth > 5) return [];
  if (json == null) return [];
  if (Array.isArray(json)) return json;
  if (typeof json !== "object") return [];

  const keys = [
    "data",
    "content",
    "items",
    "result",
    "pharmacies",
    "labs",
    "records",
  ];
  for (const k of keys) {
    const v = json[k];
    if (Array.isArray(v)) return v;
  }
  if (json.data != null && typeof json.data === "object") {
    const nested = extractListPayload(json.data, depth + 1);
    if (nested.length > 0) return nested;
  }
  return [];
}

function mapPharmacyRow(p) {
  const code =
    p?.code ?? p?.partnerCode ?? p?.pharmacyCode ?? p?.id ?? p?.value;
  const name =
    p?.displayName ??
    p?.display_name ??
    p?.name ??
    p?.label ??
    String(code ?? "");
  return {
    id: code != null ? String(code) : "",
    name,
    partner: code != null ? String(code) : "",
  };
}

function mapLabRow(p) {
  const code = p?.code ?? p?.labCode ?? p?.partnerCode ?? p?.id ?? p?.value;
  const name =
    p?.displayName ??
    p?.display_name ??
    p?.name ??
    p?.label ??
    String(code ?? "");
  return {
    id: code != null ? String(code) : "",
    name,
    partner: code != null ? String(code) : "",
  };
}

function getPatientIdForPartnerApi() {
  const u = getUserData();
  return u?.id ?? u?.patientId ?? null;
}

const PartnerLocationsContext = createContext(null);

export function PartnerLocationsProvider({ children }) {
  const [apiPharmacies, setApiPharmacies] = useState([]);
  const [apiLabs, setApiLabs] = useState([]);
  const [pharmaciesError, setPharmaciesError] = useState(null);
  const [labsError, setLabsError] = useState(null);
  const [networkError, setNetworkError] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [selectedPharmacyCode, setSelectedPharmacyCode] = useState(null);
  const [selectedLabCode, setSelectedLabCode] = useState(null);

  const patientId = getPatientIdForPartnerApi();

  useEffect(() => {
    if (!patientId) {
      setLocationsLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLocationsLoading(true);
      setPharmaciesError(null);
      setLabsError(null);
      setNetworkError(false);

      const token = getToken();
      if (!token) {
        setLocationsLoading(false);
        return;
      }

      const phUrl = `${baseUrl}/api/partners/pharmacies?patientId=${encodeURIComponent(
        patientId
      )}`;
      const labUrl = `${baseUrl}/api/partners/labs?patientId=${encodeURIComponent(
        patientId
      )}`;

      try {
        const [phRes, labRes] = await Promise.all([
          fetch(phUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }),
          fetch(labUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }),
        ]);

        let ph = [];
        let lab = [];

        if (phRes.ok) {
          const j = await phRes.json();
          ph = extractListPayload(j);
        } else {
          setPharmaciesError(`Pharmacies unavailable (${phRes.status})`);
        }

        if (labRes.ok) {
          const j = await labRes.json();
          lab = extractListPayload(j);
        } else {
          setLabsError(`Labs unavailable (${labRes.status})`);
        }

        if (!cancelled) {
          setApiPharmacies(ph);
          setApiLabs(lab);
        }
      } catch (e) {
        if (!cancelled) {
          setNetworkError(true);
          setApiPharmacies([]);
          setApiLabs([]);
        }
      } finally {
        if (!cancelled) setLocationsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const partnerPharmacies = useMemo(() => {
    if (apiPharmacies.length > 0) {
      const mapped = apiPharmacies
        .map(mapPharmacyRow)
        .filter((row) => row.id && row.partner);
      if (mapped.length > 0) return mapped;
    }
    if (networkError) return DEFAULT_PARTNER_PHARMACIES;
    if (pharmaciesError) return [];
    return DEFAULT_PARTNER_PHARMACIES;
  }, [apiPharmacies, pharmaciesError, networkError]);

  const labPartners = useMemo(() => {
    if (apiLabs.length > 0) {
      const mapped = apiLabs
        .map(mapLabRow)
        .filter((row) => row.id && row.partner);
      if (mapped.length > 0) return mapped;
    }
    if (networkError) return DEFAULT_LAB_PARTNERS;
    if (labsError) return [];
    return DEFAULT_LAB_PARTNERS;
  }, [apiLabs, labsError, networkError]);

  const value = useMemo(
    () => ({
      partnerPharmacies,
      labPartners,
      apiPharmacies,
      apiLabs,
      locationsLoading,
      pharmaciesError,
      labsError,
      networkError,
      selectedPharmacyCode,
      setSelectedPharmacyCode,
      selectedLabCode,
      setSelectedLabCode,
    }),
    [
      partnerPharmacies,
      labPartners,
      apiPharmacies,
      apiLabs,
      locationsLoading,
      pharmaciesError,
      labsError,
      networkError,
      selectedPharmacyCode,
      selectedLabCode,
    ]
  );

  return (
    <PartnerLocationsContext.Provider value={value}>
      {children}
    </PartnerLocationsContext.Provider>
  );
}

export function usePartnerLocations() {
  const ctx = useContext(PartnerLocationsContext);
  if (!ctx) {
    throw new Error(
      "usePartnerLocations must be used within PartnerLocationsProvider"
    );
  }
  return ctx;
}
