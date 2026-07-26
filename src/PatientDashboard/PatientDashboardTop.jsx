import { Phone, CalendarDays, Stethoscope, FlaskConical, Users, FileText } from "lucide-react";
import ActionCard from "../components/reuseables/ActionCard";
import DashboardAlert from "../components/dashboard/shared/DashboardAlert";
import StatCard from "../components/dashboard/shared/StatCard";
import call from "./assets/call (2).svg";
import calendarIcon from "../assets/calendarIcon.jpeg";
import { openVideoCallPreferNewTab } from "../utils/videoCallNavigation";

export function PatientDashboardTop({
  userData,
  hasSubscription,
  subscriptionMessage,
  activeMeeting,
  videoMeetingUrl,
  showMeetingModal,
  upcomingAppointments,
  isLoading,
  onCallDoctor,
  onScheduleAppointment,
  onNavigateSubscription,
  onDismissMeetingChip,
  getAppointmentStatus,
  formatTime,
  onJoinAppointment,
  onRejoinCall,
}) {
  const firstName = userData?.firstName
    ? userData.firstName.charAt(0).toUpperCase() +
      userData.firstName.slice(1).toLowerCase()
    : "there";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const nextActive = upcomingAppointments?.find(
    (a) => getAppointmentStatus?.(a) === "active"
  );
  const nextUpcoming = upcomingAppointments?.find(
    (a) => getAppointmentStatus?.(a) === "upcoming"
  );
  const highlight = nextActive || nextUpcoming;

  const activeCount = upcomingAppointments?.filter(
    (a) => getAppointmentStatus?.(a) === "active"
  ).length;
  const upcomingCount = upcomingAppointments?.filter(
    (a) => getAppointmentStatus?.(a) === "upcoming"
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-medium text-blue-600">{greeting}</p>
        <h1 className="mt-1 text-2xl font-bold text-[#020e7c] sm:text-3xl">
          Welcome, {firstName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Book care, join consultations, and track your appointments in one place.
        </p>
      </div>

      <div className="space-y-3">
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

        {showMeetingModal && videoMeetingUrl && !activeMeeting?.roomUrl && (
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
            title={nextActive ? "Appointment happening now" : "Next appointment"}
            message={
              nextActive
                ? `Dr. ${highlight.name}: join your consultation.`
                : `Dr. ${highlight.name} on ${highlight.date} at ${formatTime?.(highlight.time)}`
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Active now"
          value={activeCount}
          accent="green"
        />
        <StatCard
          label="Upcoming"
          value={upcomingCount}
          accent="blue"
        />
        <div className="col-span-2 sm:col-span-1">
          <StatCard
            label="Total booked"
            value={upcomingAppointments?.length ?? 0}
            accent="slate"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ActionCard
          title="Call a General Practitioner"
          description="Speak with a GP now. Usually under a few minutes wait."
          image={call}
          accent="blue"
          disabled={!!activeMeeting?.roomUrl || isLoading}
          onClick={onCallDoctor}
          icon={<Phone className="h-7 w-7" />}
        />
        <ActionCard
          title="Schedule an appointment"
          description="Choose a specialist and pick a time that works for you."
          image={calendarIcon}
          accent="teal"
          onClick={onScheduleAppointment}
          icon={<CalendarDays className="h-7 w-7" />}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Notes", icon: <FileText size={18} />, path: "patient-notes" },
          {
            label: "Labs",
            icon: <FlaskConical size={18} />,
            path: "patient-investigations",
          },
          { label: "Dependents", icon: <Users size={18} />, path: "add-dependent" },
          { label: "Profile", icon: <Stethoscope size={18} />, path: "profile" },
        ].map((item) => (
          <a
            key={item.path}
            href={`/patient-dashboard/${item.path}`}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-semibold text-[#020e7c] shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50"
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default PatientDashboardTop;
