import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Download,
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

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | ready | sent
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [labCode, setLabCode] = useState("");
  const [labSearch, setLabSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const load = async () => {
    if (!patientId || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);
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
      setOrders(sorted);
    } catch (e) {
      toast.error(e.message || "Failed to load investigations");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
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
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#020e7c]/80">
              Lab orders
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Investigations
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              Review tests your doctor ordered, download a copy, then choose
              which partner lab should receive the order. No payment on this
              page.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { id: "all", label: "All", count: counts.all },
            { id: "ready", label: "Ready to send", count: counts.ready },
            { id: "sent", label: "Sent", count: counts.sent },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
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

        {loading ? (
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
            {visibleOrders.map((order) => {
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
                          Order #{order.orderId}
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
                        Ordered by Dr {order.doctorName} ·{" "}
                        {formatDate(order.createdDate)}
                      </p>
                      {sent && order.labPartner && (
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <Building2 className="h-3.5 w-3.5" />
                          Partner: {order.labPartner}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => downloadPdf(order.orderId)}
                        disabled={downloading === order.orderId}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
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
                          className="inline-flex items-center gap-2 rounded-full bg-[#020e7c] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#03129a]"
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
                  Order #{activeOrder.orderId} ·{" "}
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
