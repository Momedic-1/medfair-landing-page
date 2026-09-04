import { useEffect, useState } from "react";
import axios from "axios";
import AddNoteModal from "./AddNote";
import { baseUrl } from "../env";
import { FileText, FlaskConical, Loader2, Pill, RefreshCw } from "lucide-react";

const PAGE_SIZE = 5;

function formatWhen(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(value);
  }
}

function pickRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
}

/**
 * Doctor Notes — Option A: recent consults/notes list (paginated).
 * Open a visit to create or continue note, medications, and lab orders.
 */
const Search = () => {
  const token = JSON.parse(localStorage.getItem("authToken"))?.token;
  const userData = JSON.parse(localStorage.getItem("userData"));
  const doctorId = userData?.id;

  const [visits, setVisits] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workspacePatientId, setWorkspacePatientId] = useState(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const load = async (pageNum = page) => {
    if (!token || !doctorId) {
      setError("Please sign in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${baseUrl}/api/consultations/doctor/${doctorId}/recent-visits`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: pageNum, size: PAGE_SIZE },
        }
      );
      const data = res.data || {};
      const rows = pickRows(data);
      setVisits(rows);
      setPage(typeof data.page === "number" ? data.page : pageNum);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || rows.length);
      setHasNext(Boolean(data.hasNext));
      setHasPrevious(Boolean(data.hasPrevious));
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Could not load visits");
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0);
  }, []);

  const openWorkspace = (visit) => {
    if (!visit?.patientId) return;
    try {
      localStorage.setItem("patientId", String(visit.patientId));
    } catch {
      /* ignore */
    }
    setWorkspacePatientId(String(visit.patientId));
    setWorkspaceOpen(true);
  };

  const closeWorkspace = () => {
    setWorkspaceOpen(false);
    setWorkspacePatientId(null);
    load(page);
  };

  return (
    <div className="mx-auto max-w-4xl px-3 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient visits</h1>
          <p className="mt-1 text-sm text-slate-600">
            Open a consultation to write or edit the note, add medications, and
            order investigations — even if nothing was recorded during the call.
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(page)}
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#020e7c]" />
        </div>
      ) : error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </p>
      ) : visits.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-12 text-center text-slate-500">
          No visits yet. After you complete a consultation, it will appear here.
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {visits.map((visit) => (
              <li
                key={visit.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {visit.patientName || "Patient"}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {visit.category || visit.channel} · {formatWhen(visit.dateTime)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-semibold ${
                          visit.hasNote
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {visit.hasNote ? "Note on file" : "No note yet — you can start one"}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> Note
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Pill className="h-3.5 w-3.5" /> Medication
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FlaskConical className="h-3.5 w-3.5" /> Lab tests
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openWorkspace(visit)}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#020e7c] px-4 py-2.5 text-sm font-semibold text-white sm:w-auto"
                  >
                    {visit.hasNote ? "Open visit" : "Start note"}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Showing {visits.length} of {totalElements}
              {totalPages > 0 ? ` · Page ${page + 1} of ${totalPages}` : ""}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!hasPrevious || loading}
                onClick={() => load(page - 1)}
                className="rounded-xl border px-3 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={!hasNext || loading}
                onClick={() => load(page + 1)}
                className="rounded-xl border px-3 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <AddNoteModal
        isOpen={workspaceOpen}
        onClose={closeWorkspace}
        onNoteAdded={() => load(page)}
        patientId={workspacePatientId}
      />
    </div>
  );
};

export default Search;
