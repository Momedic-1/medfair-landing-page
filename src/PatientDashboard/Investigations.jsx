import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  Download,
  FileUp,
  FlaskConical,
  Loader2,
  RefreshCw,
  Search,
  Send,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { baseUrl } from "../env";
import { formatDate, getId, getToken } from "../utils";
import { usePartnerLocations } from "../context/PartnerLocationsContext";
import {
  isSamePatientPageData,
  readPatientPageCache,
  writePatientPageCache,
} from "../utils/patientPageCache";
import SimplePager from "../components/common/SimplePager";

const PAGE_SIZE = 5;

function partnerCode(lab) {
  return String(lab?.partner || lab?.id || lab?.code || "").trim();
}

function partnerLabel(lab) {
  return String(lab?.name || lab?.displayName || partnerCode(lab) || "Lab partner").trim();
}

/**
 * Patient investigations — view only, choose among partner labs, download PDF.
 */
export default function Investigations() {
  const patientId = getId();
  const token = getToken();
  const {
    labPartners,
    locationsLoading,
    labsError,
    setSelectedLabCode,
  } = usePartnerLocations();

  const cacheKey = patientId ? `investigations:${patientId}` : null;
  const cachedOrders = cacheKey ? readPatientPageCache(cacheKey) : null;
  const [orders, setOrders] = useState(() =>
    Array.isArray(cachedOrders) ? cachedOrders : []
  );
  const [loading, setLoading] = useState(() => !Array.isArray(cachedOrders));
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all"); // all | ready | sent
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [labCode, setLabCode] = useState("");
  const [labSearch, setLabSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [page, setPage] = useState(0);

  const load = async ({ silent = false } = {}) => {
    if (!patientId || !token) {
      setLoading(false);
      return;
    }
    if (silent) setRefreshing(true);
    else if (!orders.length) setLoading(true);
    try {
      const res = await fetch(
        `${baseUrl}/api/investigations/orders/patient/${patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Could not load investigations");
      const data = await res.json();
      const sorted = (Array.isArray(data) ? data : []).sort(
        (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
      );
      setOrders((prev) =>
        isSamePatientPageData(prev, sorted) ? prev : sorted
      );
      if (cacheKey) writePatientPageCache(cacheKey, sorted);
    } catch (e) {
      setOrders((prev) => {
        if (prev.length) return prev;
        toast.error(e.message || "Failed to load investigations");
        return [];
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load({ silent: Array.isArray(cachedOrders) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const counts = useMemo(() => {
    const ready = orders.filter((o) => !(o.sentToLab || o.status === "sent")).length;
    const sent = orders.filter((o) => o.sentToLab || o.status === "sent").length;
    return { all: orders.length, ready, sent };
  }, [orders]);

  const visibleOrders = useMemo(() => {
    if (filter === "ready") {
      return orders.filter((o) => !(o.sentToLab || o.status === "sent"));
    }
    if (filter === "sent") {
      return orders.filter((o) => o.sentToLab || o.status === "sent");
    }
    return orders;
  }, [orders, filter]);

  const totalPages = Math.max(1, Math.ceil(visibleOrders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pagedOrders = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return visibleOrders.slice(start, start + PAGE_SIZE);
  }, [visibleOrders, safePage]);

  useEffect(() => {
    setPage(0);
  }, [filter]);

  const activeOrder = useMemo(
    () => orders.find((o) => String(o.orderId) === String(activeOrderId)) || null,
    [orders, activeOrderId]
  );

  const filteredLabs = useMemo(() => {
    const q = labSearch.trim().toLowerCase();
    const list = Array.isArray(labPartners) ? labPartners : [];
    if (!q) return list;
    return list.filter((lab) => {
      const hay = `${partnerLabel(lab)} ${partnerCode(lab)}`.toLowerCase();
      return hay.includes(q);
    });
  }, [labPartners, labSearch]);

  const selectedLab = useMemo(
    () => (labPartners || []).find((l) => partnerCode(l) === labCode) || null,
    [labPartners, labCode]
  );

  const openSendModal = (orderId) => {
    setActiveOrderId(orderId);
    setLabCode("");
    setLabSearch("");
  };

  const closeSendModal = () => {
    setActiveOrderId(null);
    setLabCode("");
    setLabSearch("");
  };

  const sendToLab = async () => {
    if (!activeOrder || !labCode) {
      toast.warning("Please choose a lab partner");
      return;
    }
    if (activeOrder.sentToLab) {
      toast.info("This order was already sent to a lab");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(
        `${baseUrl}/api/investigations/select-lab?orderId=${activeOrder.orderId}&labPartner=${encodeURIComponent(labCode)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const text = await res.text();
      if (!res.ok) throw new Error(text || "Could not send to lab");
      if (typeof setSelectedLabCode === "function") setSelectedLabCode(labCode);
      toast.success(
        `Sent to ${partnerLabel(selectedLab) || labCode}. The lab will receive your order by email.`
      );
      closeSendModal();
      await load();
    } catch (e) {
      toast.error(e.message || "Send to lab failed");
    } finally {
      setSending(false);
    }
  };

  const downloadPdf = async (orderId) => {
    setDownloading(orderId);
    try {
      const res = await fetch(
        `${baseUrl}/api/investigations/orders/${orderId}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `investigation-order-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e.message || "Could not download PDF");
    } finally {
      setDownloading(null);
    }
  };

  const isSent = (order) => order.sentToLab || order.status === "sent";

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-5xl px-3 py-6 sm:px-6">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#020e7c]/80">
              Lab orders
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Investigations
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              Review tests your doctor ordered, download a copy, then choose
              which partner lab should receive the order.
            </p>
          </div>
          <button
            type="button"
            onClick={() => load({ silent: orders.length > 0 })}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </header>

        <Link
          to="/patient-dashboard/profile?section=documents"
          className="mb-6 flex items-center gap-3 rounded-2xl border border-teal-200/80 bg-teal-50/80 px-4 py-3 text-left shadow-sm transition hover:border-teal-300 hover:bg-teal-50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
            <FileUp className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-slate-900">
              Upload lab or radiology results
            </span>
            <span className="mt-0.5 block text-xs text-slate-600">
              Add PDFs or images from outside labs so your doctor can review them.
            </span>
          </span>
        </Link>

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { id: "all", label: "All", count: counts.all },
            { id: "ready", label: "Ready to send", count: counts.ready },
            { id: "sent", label: "Sent", count: counts.sent },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setFilter(tab.id);
                setPage(0);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === tab.id
                  ? "bg-[#020e7c] text-white shadow"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                  filter === tab.id ? "bg-white/20" : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {loading && !orders.length ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-9 w-9 animate-spin text-[#020e7c]" />
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <FlaskConical className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <p className="text-base font-medium text-slate-800">
              {filter === "sent"
                ? "No sent orders yet"
                : filter === "ready"
                  ? "Nothing waiting to send"
                  : "No investigations yet"}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              When your doctor orders lab tests, they will show up here for you
              to download or forward to a partner lab.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {loading && orders.length > 0 ? (
              <p className="text-xs text-slate-500">Updating…</p>
            ) : null}
            {pagedOrders.map((order) => {
              const sent = isSent(order);
              const tests = order.items || [];
              return (
                <article
                  key={order.orderId}
                  className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_10px_40px_-24px_rgba(2,14,124,0.35)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-slate-900">
                          Lab order · {formatDate(order.createdDate)}
                        </h2>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            sent
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-indigo-50 text-[#020e7c] ring-1 ring-indigo-200"
                          }`}
                        >
                          {sent ? "Sent to lab" : "Ready to send"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        Ordered by Dr {order.doctorName}
                      </p>
                      {sent && order.labPartner && (
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <Building2 className="h-3.5 w-3.5" />
                          Partner: {order.labPartner}
                        </p>
                      )}
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        onClick={() => downloadPdf(order.orderId)}
                        disabled={downloading === order.orderId}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 sm:w-auto"
                      >
                        {downloading === order.orderId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Download PDF
                      </button>
                      {!sent && (
                        <button
                          type="button"
                          onClick={() => openSendModal(order.orderId)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#020e7c] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#03129a] sm:w-auto"
                        >
                          <Send className="h-4 w-4" />
                          Choose lab &amp; send
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="px-5 py-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Tests ({tests.length})
                    </p>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {tests.map((item, idx) => (
                        <li
                          key={`${order.orderId}-${idx}`}
                          className="flex items-start gap-2 rounded-2xl bg-slate-50 px-3 py-2.5 text-sm text-slate-800"
                        >
                          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-[#020e7c]/70" />
                          <span>{item.testName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
            <SimplePager
              page={safePage}
              totalPages={totalPages}
              totalElements={visibleOrders.length}
              pageSize={PAGE_SIZE}
              onPrev={() => setPage((p) => Math.max(0, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            />
          </div>
        )}
      </div>

      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#020e7c]">
                  Step 1 of 1
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  Choose a partner lab
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {(activeOrder.items || []).length} test
                  {(activeOrder.items || []).length === 1 ? "" : "s"}. Pick the
                  lab that should process this order.
                </p>
              </div>
              <button
                type="button"
                onClick={closeSendModal}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-slate-100 px-5 py-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={labSearch}
                  onChange={(e) => setLabSearch(e.target.value)}
                  placeholder="Search partner labs…"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none ring-[#020e7c]/30 focus:bg-white focus:ring-2"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {(labPartners || []).length} partner
                {(labPartners || []).length === 1 ? "" : "s"} available for your
                account
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {locationsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-7 w-7 animate-spin text-[#020e7c]" />
                </div>
              ) : labsError ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {labsError}
                </p>
              ) : filteredLabs.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  No labs match “{labSearch}”.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredLabs.map((lab) => {
                    const code = partnerCode(lab);
                    const selected = labCode === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setLabCode(code)}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${
                          selected
                            ? "border-[#020e7c] bg-[#020e7c]/5 shadow-sm ring-2 ring-[#020e7c]/25"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl ${
                                selected
                                  ? "bg-[#020e7c] text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              <Building2 className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {partnerLabel(lab)}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                Partner code: {code}
                              </p>
                            </div>
                          </div>
                          {selected ? (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#020e7c]" />
                          ) : (
                            <span className="mt-1 h-5 w-5 shrink-0 rounded-full border border-slate-300" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
              <p className="text-sm text-slate-600">
                {selectedLab ? (
                  <>
                    Selected:{" "}
                    <span className="font-semibold text-slate-900">
                      {partnerLabel(selectedLab)}
                    </span>
                  </>
                ) : (
                  "Select a partner lab to continue"
                )}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeSendModal}
                  className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={sending || !labCode}
                  onClick={sendToLab}
                  className="inline-flex items-center gap-2 rounded-full bg-[#020e7c] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send to selected lab
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
