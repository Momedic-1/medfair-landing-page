import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  FileUp,
  FlaskConical,
  Lock,
  MessageCircle,
  Phone,
  Pill,
  Send,
  Thermometer,
  Users,
  Video,
} from "lucide-react";
import DashboardAlert from "../components/dashboard/shared/DashboardAlert";
import { openVideoCallPreferNewTab } from "../utils/videoCallNavigation";
import {
  canJoinAppointment,
  getAppointmentStatus,
  sortAppointmentsByStatus,
} from "../utils/appointmentStatus";
import { formatAppointmentDate, formatTime } from "../utils";

const TILES = [
  {
    id: "call-gp",
    title: "Call a GP",
    description: "Instant video consult now.",
    accent: "#020e7c",
    icon: Phone,
    action: "call",
  },
  {
    id: "book",
    title: "Book a doctor",
    description: "Pick a specialist and time.",
    accent: "#0EA5A4",
    icon: Users,
    action: "book",
  },
  {
    id: "symptoms",
    title: "Check symptoms",
    description: "AI guidance before you call.",
    accent: "#2563EB",
    icon: Thermometer,
    action: "symptoms",
  },
  {
    id: "pharmacy",
    title: "Pharmacy",
    description: "Order your medications.",
    accent: "#7C3AED",
    icon: Pill,
    action: "pharmacy",
  },
  {
    id: "labs",
    title: "Lab tests",
    description: "Orders and partner labs.",
    accent: "#0891B2",
    icon: FlaskConical,
    action: "labs",
  },
  {
    id: "results",
    title: "Upload results",
    description: "Lab and radiology files.",
    accent: "#0F766E",
    icon: FileUp,
    action: "results",
  },
  {
    id: "chat",
    title: "Doctor chat",
    description: "Message after consults.",
    accent: "#1D4ED8",
    icon: MessageCircle,
    action: "chat",
  },
];

export function PatientDashboardTop({
  userData,
  hasSubscription,
  subscriptionMessage,
  activeMeeting,
  doctorReadyCall,
  videoMeetingUrl,
  showMeetingModal,
  upcomingAppointments,
  appointmentsLoading,
  isLoading,
  onCallDoctor,
  onScheduleAppointment,
  onNavigateSubscription,
  onDismissMeetingChip,
  getAppointmentStatus: getStatusProp,
  formatTime: formatTimeProp,
  onJoinAppointment,
  onRejoinCall,
  onJoinDoctorReadyCall,
  onCancelAppointment,
  joiningSlotId,
  cancellingSlotId,
  showCalendarSection = false,
  onToggleCalendar,
}) {
  const navigate = useNavigate();
  const [aiDraft, setAiDraft] = useState("");

  const firstName = userData?.firstName
    ? userData.firstName.charAt(0).toUpperCase() +
      userData.firstName.slice(1).toLowerCase()
    : "there";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const resolveStatus = getStatusProp || getAppointmentStatus;
  const resolveTime = formatTimeProp || formatTime;

  const isJoinable = (a) =>
    a?.canJoin === true || resolveStatus?.(a) === "active";

  const nextActive = upcomingAppointments?.find((a) => isJoinable(a));
  const nextUpcoming = upcomingAppointments?.find(
    (a) => !isJoinable(a) && resolveStatus?.(a) === "upcoming"
  );
  const highlight = nextActive || nextUpcoming;

  const sortedUpcoming = useMemo(
    () => sortAppointmentsByStatus(upcomingAppointments || []).slice(0, 4),
    [upcomingAppointments]
  );

  const avatarUrl = userData?.imageUrl || userData?.profileImageUrl || "";
  const initials = `${userData?.firstName?.[0] || ""}${userData?.lastName?.[0] || ""}`
    .toUpperCase()
    .slice(0, 2) || "M";

  const handleTile = (action) => {
    switch (action) {
      case "call":
        onCallDoctor?.();
        break;
      case "book":
        onScheduleAppointment?.();
        break;
      case "symptoms":
        navigate("/patient-dashboard/check-symptoms");
        break;
      case "pharmacy":
        navigate("/patient-dashboard/patient-notes");
        break;
      case "labs":
        navigate("/patient-dashboard/patient-investigations");
        break;
      case "results":
        navigate("/patient-dashboard/profile?section=documents");
        break;
      case "chat":
        navigate("/patient-dashboard/consultation-history");
        break;
      default:
        break;
    }
  };

  const submitAi = (e) => {
    e?.preventDefault?.();
    const q = aiDraft.trim();
    navigate(
      q
        ? `/patient-dashboard/check-symptoms?q=${encodeURIComponent(q)}`
        : "/patient-dashboard/check-symptoms"
    );
  };

  return (
    <div className="relative mx-auto w-full max-w-3xl pb-36 sm:max-w-4xl sm:pb-40 lg:max-w-5xl">
      <section className="relative mb-5 overflow-hidden rounded-2xl bg-[#020e7c] px-5 py-5 text-white shadow-md sm:px-6 sm:py-6">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 left-1/3 h-44 w-44 rounded-full bg-teal-400/15"
          aria-hidden
        />
        <div className="relative flex items-start gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white/40"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold ring-2 ring-white/25">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-blue-100/95">{greeting}</p>
            <h1 className="mt-0.5 truncate text-2xl font-bold tracking-tight sm:text-[1.75rem]">
              {firstName}
            </h1>
          </div>
        </div>
      </section>

      <div className="mb-5 space-y-3">
        {hasSubscription === false && (
          <DashboardAlert
            variant="warning"
            title="Subscription required"
            message={subscriptionMessage}
            primaryAction={
              <button
                type="button"
                onClick={onNavigateSubscription}
                className="rounded-lg bg-[#020e7c] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                View plans
              </button>
            }
          />
        )}

        {hasSubscription === null && (
          <div className="animate-pulse rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="h-4 w-48 rounded bg-gray-200" />
          </div>
        )}

        {doctorReadyCall?.roomUrl && !activeMeeting?.roomUrl && (
          <DashboardAlert
            variant="success"
            title="Doctor is ready"
            message={
              doctorReadyCall.doctorName
                ? `${doctorReadyCall.doctorName} has accepted your call. Tap Join call.`
                : "A doctor has accepted your call. Tap Join call."
            }
            primaryAction={
              <button
                type="button"
                onClick={() => onJoinDoctorReadyCall?.()}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Join call
              </button>
            }
          />
        )}

        {activeMeeting?.roomUrl && (
          <DashboardAlert
            variant="success"
            title={
              nextActive
                ? "Your consultation is in progress"
                : "You have an active call"
            }
            message={
              nextActive
                ? `Dr. ${highlight?.name || "your doctor"}: if you cannot see each other, tap Rejoin.`
                : "You left the call. Tap Rejoin to return. The doctor ends the consultation when finished."
            }
            primaryAction={
              <button
                type="button"
                onClick={() => {
                  if (onRejoinCall) {
                    onRejoinCall();
                    return;
                  }
                  openVideoCallPreferNewTab(activeMeeting.roomUrl);
                }}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Rejoin video call
              </button>
            }
          />
        )}

        {showMeetingModal &&
          videoMeetingUrl &&
          !activeMeeting?.roomUrl &&
          !doctorReadyCall?.roomUrl && (
            <DashboardAlert
              variant="info"
              title="Your doctor is ready"
              message="The doctor may already be waiting in the video room. Tap Join now and keep the page open while we connect you."
              primaryAction={
                <button
                  type="button"
                  onClick={() => openVideoCallPreferNewTab(videoMeetingUrl)}
                  className="rounded-lg bg-[#020e7c] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Join call
                </button>
              }
              onDismiss={onDismissMeetingChip}
            />
          )}

        {highlight && !activeMeeting?.roomUrl && (
          <DashboardAlert
            variant={nextActive ? "success" : "info"}
            title={
              nextActive
                ? highlight.doctorJoined &&
                  highlight.joinOpensAt &&
                  highlight.serverNow &&
                  new Date(highlight.serverNow) < new Date(highlight.joinOpensAt)
                  ? "Doctor is waiting"
                  : "Appointment happening now"
                : "Next appointment"
            }
            message={
              nextActive
                ? highlight.doctorJoined
                  ? `Dr. ${highlight.name} is in the room. Join your consultation.`
                  : `Dr. ${highlight.name}: join your consultation.`
                : `Dr. ${highlight.name} on ${highlight.date} at ${resolveTime?.(highlight.time)}. Join opens 5 minutes before, or when the doctor joins.`
            }
            primaryAction={
              nextActive ? (
                <button
                  type="button"
                  onClick={() => onJoinAppointment?.(highlight.slotId)}
                  className="rounded-lg bg-[#020e7c] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Join now
                </button>
              ) : null
            }
          />
        )}
      </div>

      <div className="mb-3">
        <h2 className="text-lg font-bold text-[#020e7c] sm:text-xl">
          What do you need today?
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Book, check symptoms, pharmacy, labs, upload results, or chat.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-3">
        {TILES.map((tile) => {
          const Icon = tile.icon;
          const disabled =
            tile.action === "call" &&
            (!!activeMeeting?.roomUrl ||
              !!doctorReadyCall?.roomUrl ||
              !!isLoading);

          return (
            <button
              key={tile.id}
              type="button"
              disabled={disabled}
              onClick={() => handleTile(tile.action)}
              className="group relative flex min-h-[120px] flex-col items-start overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#020e7c] disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-[128px] sm:p-4"
            >
              <span
                className="absolute inset-y-0 left-0 w-1"
                style={{ backgroundColor: tile.accent }}
                aria-hidden
              />
              <span
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: tile.accent }}
              >
                <Icon className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <p className="pr-1 text-[15px] font-bold leading-snug text-[#020e7c]">
                {tile.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {tile.description}
              </p>
            </button>
          );
        })}
      </div>

      <section className="mb-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 sm:px-5">
          <h3 className="text-base font-bold text-[#020e7c]">
            Upcoming appointments
          </h3>
          <button
            type="button"
            onClick={() => onToggleCalendar?.()}
            className="shrink-0 text-sm font-semibold text-[#020e7c] hover:underline"
          >
            {showCalendarSection ? "Hide calendar" : "View calendar"}
          </button>
        </div>

        <div className="p-4 sm:p-5">
          {appointmentsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : sortedUpcoming.length === 0 ? (
            <div className="flex flex-col items-center px-2 py-8 text-center">
              <CalendarDays className="mb-2 h-9 w-9 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">
                No upcoming appointments
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Book a doctor or call a GP to get started.
              </p>
              <button
                type="button"
                onClick={onScheduleAppointment}
                className="mt-4 rounded-xl bg-[#020e7c] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900"
              >
                Book a doctor
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sortedUpcoming.map((apt) => {
                const status = resolveStatus?.(apt);
                const canJoin = canJoinAppointment(apt);
                const timeLabel = apt.time ? resolveTime?.(apt.time) : "";
                const dateLabel = apt.date
                  ? formatAppointmentDate(apt.date)
                  : "";

                return (
                  <li
                    key={apt.slotId || `${apt.name}-${apt.date}-${apt.time}`}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#020e7c]/10 text-[#020e7c]">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#020e7c]">
                        Dr. {apt.name || "Doctor"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {[
                          dateLabel,
                          timeLabel,
                          status === "active" ? "Ready to join" : null,
                          status === "upcoming" ? "Upcoming" : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    {canJoin ? (
                      <button
                        type="button"
                        disabled={joiningSlotId === apt.slotId}
                        onClick={() => onJoinAppointment?.(apt.slotId)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#020e7c] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-900 disabled:opacity-60"
                      >
                        <Video className="h-3.5 w-3.5" />
                        {joiningSlotId === apt.slotId ? "…" : "Join"}
                      </button>
                    ) : onCancelAppointment && status === "upcoming" ? (
                      <button
                        type="button"
                        disabled={cancellingSlotId === apt.slotId}
                        onClick={() => onCancelAppointment?.(apt)}
                        className="shrink-0 text-xs font-semibold text-slate-400 hover:text-red-600"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 lg:left-[260px]">
        <div className="pointer-events-auto mx-auto w-full max-w-3xl px-4 pb-4 pt-2 sm:max-w-4xl sm:px-6 lg:max-w-5xl">
          <form
            onSubmit={submitAi}
            className="flex items-center gap-2 rounded-2xl border-2 border-[#020e7c]/15 bg-white px-3 py-2.5 shadow-[0_10px_28px_rgba(2,14,124,0.12)]"
          >
            <Thermometer className="ml-1 h-4 w-4 shrink-0 text-[#020e7c]/70" />
            <input
              value={aiDraft}
              onChange={(e) => setAiDraft(e.target.value)}
              placeholder="Describe your symptoms…"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#020e7c] text-white hover:bg-blue-900"
              aria-label="Check symptoms"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between gap-2 px-1 text-[10px] text-slate-400 sm:text-[11px]">
            <p className="min-w-0 truncate">
              Guidance only, not a diagnosis. A doctor confirms care.
            </p>
            <span className="inline-flex shrink-0 items-center gap-1">
              <Lock className="h-3 w-3" />
              Private and secure
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboardTop;
