import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../env";
import { getId, getToken } from "../utils";
import { Loader2, MessageCircle, RefreshCw } from "lucide-react";

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

function ConsultationChat({ threadKey, open, closesAt, onClose }) {
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const token = getToken();
  const myId = Number(getId());

  const load = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${baseUrl}/api/consultations/chat/${encodeURIComponent(threadKey)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.messages || []);
    } catch (e) {
      setError(e?.response?.data?.message || "Could not load chat");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Silent poll so new messages appear without wiping the thread with a spinner.
    const t = setInterval(() => load({ silent: true }), 15000);
    return () => clearInterval(t);
  }, [threadKey]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim() || !open) return;
    setSending(true);
    try {
      await axios.post(
        `${baseUrl}/api/consultations/chat/${encodeURIComponent(threadKey)}`,
        { body: body.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBody("");
      await load({ silent: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Could not send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="font-semibold text-slate-900">Consultation chat</p>
            <p className="text-xs text-slate-500">
              {open
                ? `Open until ${formatWhen(closesAt)}`
                : "This chat window has closed (24 hours)"}
            </p>
          </div>
          <button type="button" className="text-sm text-slate-600" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#020e7c]" />
            </div>
          ) : messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No messages yet.</p>
          ) : (
            messages.map((m) => {
              const mine = Number(m.senderUserId) === myId;
              return (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? "ml-auto bg-[#020e7c] text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  <p className="mb-1 text-[10px] opacity-70">
                    {m.senderRole} · {formatWhen(m.createdAt)}
                  </p>
                  <p>{m.body}</p>
                </div>
              );
            })
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <form onSubmit={send} className="flex gap-2 border-t p-3">
          <input
            className="flex-1 rounded-xl border px-3 py-2 text-sm"
            placeholder={open ? "Type a message…" : "Chat closed"}
            value={body}
            disabled={!open || sending}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={!open || sending || !body.trim()}
            className="rounded-xl bg-[#020e7c] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

const PAGE_SIZE = 5;

/** Accept page wrapper, raw array, or a single unwrapped row. */
function pickConsultationRows(payload) {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  const raw = payload.items ?? payload.content ?? payload.records;
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && (raw.id || raw.doctorName || raw.channel)) {
    return [raw];
  }
  if (payload.id && (payload.channel || payload.doctorName)) {
    return [payload];
  }
  return [];
}

export default function ConsultationHistory() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatTarget, setChatTarget] = useState(null);
  const token = getToken();
  const userId = getId();

  const load = async (pageNum = page) => {
    if (!token || !userId) {
      setError("Please sign in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${baseUrl}/api/consultations/history/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: pageNum, size: PAGE_SIZE },
        }
      );
      const data = res?.data;
      const rows = pickConsultationRows(data);
      setItems(rows);
      setPage(typeof data?.page === "number" ? data.page : pageNum);
      setTotalPages(
        typeof data?.totalPages === "number"
          ? data.totalPages
          : rows.length > 0
            ? 1
            : 0
      );
      setTotalElements(
        typeof data?.totalElements === "number" ? data.totalElements : rows.length
      );
      setHasNext(Boolean(data?.hasNext));
      setHasPrevious(Boolean(data?.hasPrevious));
    } catch (e) {
      setError(e?.response?.data?.message || "Could not load consultation history");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0);
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-3 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consultation history</h1>
          <p className="mt-1 text-sm text-slate-600">
            Past GP and specialist visits. Chat with your doctor for 24 hours after the
            consultation (free in-app messaging).
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
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-12 text-center text-slate-500">
          No consultations yet.
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.doctorName}</p>
                    <p className="text-sm text-slate-600">
                      {item.category} · {item.specializationLabel || item.channel} ·{" "}
                      {item.status}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{formatWhen(item.dateTime)}</p>
                    {item.organizationName && (
                      <p className="mt-1 text-xs text-emerald-700">
                        Paid by {item.organizationName} (organization)
                      </p>
                    )}
                    {!item.organizationName && item.paidBy === "PERSONAL_PLAN" && (
                      <p className="mt-1 text-xs text-slate-500">Paid with personal plan</p>
                    )}
                  </div>
                  {(item.chatOpen || item.status === "completed") && (
                    <button
                      type="button"
                      onClick={() =>
                        setChatTarget({
                          threadKey: item.id,
                          open: item.chatOpen,
                          closesAt: item.chatClosesAt,
                        })
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-[#020e7c] px-3 py-2 text-sm font-semibold text-white"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {item.chatOpen ? "Open chat" : "View chat"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Showing {items.length} of {totalElements}
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

      {chatTarget && (
        <ConsultationChat
          threadKey={chatTarget.threadKey}
          open={chatTarget.open}
          closesAt={chatTarget.closesAt}
          onClose={() => setChatTarget(null)}
        />
      )}
    </div>
  );
}
