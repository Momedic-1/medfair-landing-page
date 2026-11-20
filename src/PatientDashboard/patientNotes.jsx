import React, { useState, useEffect } from "react";
import { baseUrl } from "../env";
import Table from "../components/reuseables/Table";
import axios from "axios";
import { getId, getToken } from "../utils";
import {
  isSamePatientPageData,
  readPatientPageCache,
  writePatientPageCache,
} from "../utils/patientPageCache";

const PatientNotes = () => {
  const patientId = getId();
  const token = getToken();
  const cacheKey = patientId ? `pharmacy-notes:${patientId}` : null;
  const cached = cacheKey ? readPatientPageCache(cacheKey) : null;

  const [results, setResults] = useState(() =>
    Array.isArray(cached) ? cached : []
  );
  const [loading, setLoading] = useState(() => !Array.isArray(cached));
  const [error, setError] = useState(null);

  const fetchPatients = async ({ silent = false } = {}) => {
    if (!patientId || !token) {
      setLoading(false);
      return;
    }
    if (!silent && !results.length) setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/notes/patient/${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const raw = response?.data;
      const next = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.content)
            ? raw.content
            : [];
      setResults((prev) => (isSamePatientPageData(prev, next) ? prev : next));
      if (cacheKey) writePatientPageCache(cacheKey, next);
      setError(null);
    } catch (err) {
      setError(err.message);
      setResults((prev) => (prev.length ? prev : []));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients({ silent: Array.isArray(cached) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[50vh]">
      <div className="w-full md:p-4">
        {error && !results.length ? (
          <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <Table
          data={results}
          isLoading={loading && results.length === 0}
          patientId={patientId}
          emptyMessage={"No pharmacy orders yet"}
        />
      </div>
    </div>
  );
};

export default PatientNotes;
