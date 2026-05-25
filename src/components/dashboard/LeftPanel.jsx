import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import WelcomeBack from "./WelcomeBack/WelcomeBack";
import Appointments from "./Appointments";
import AppointmentRequests from "./AppointmentRequests";
import DoctorDashboardHeader from "./DoctorDashboardHeader";
import DashboardAlert from "./shared/DashboardAlert";
import StatCard from "./shared/StatCard";
import DashboardSection from "./shared/DashboardSection";
import { baseUrl } from "../../env";
import {
  isDoctorProfileComplete,
  getMissingProfileFields,
} from "../../utils/doctorProfileComplete";
import { getToken } from "../../utils";

function getAppointmentDateTime(appointment) {
  if (appointment.startTime) return new Date(appointment.startTime);
  if (appointment.date && appointment.time) {
    return new Date(`${appointment.date}T${appointment.time}`);
  }
  return null;
}

function getAppointmentStatus(appointment, now = new Date()) {
  const appointmentTime = getAppointmentDateTime(appointment);
  if (!appointmentTime) return "unknown";
  const minutesDiff = Math.floor(
    (appointmentTime.getTime() - now.getTime()) / 60000
  );
  if (minutesDiff > 45) return "over";
  if (minutesDiff >= -5 && minutesDiff <= 45) return "active";
  return "upcoming";
}

function LeftPanel({ status, setStatus }) {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [slotCount, setSlotCount] = useState(0);
  const [profilePayload, setProfilePayload] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [callAlerts, setCallAlerts] = useState(null);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const doctorId = userData?.id;
  const token = getToken();

  const profileComplete = isDoctorProfileComplete(profilePayload);
  const missingFields = getMissingProfileFields(profilePayload);

  const fetchProfile = useCallback(async () => {
    if (!doctorId || !token) {
      setProfileLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        `${baseUrl}/api/v1/doctor-profile/profile-full/${doctorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfilePayload(res.data);
    } catch {
      setProfilePayload(null);
    } finally {
      setProfileLoading(false);
    }
  }, [doctorId, token]);

  const getDoctorsAppointmentRequest = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/appointments/upcoming/doctor/${doctorId}?_=${Date.now()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(response?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSlotCount = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/appointments/available/${doctorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const list = response?.data || [];
      setSlotCount(list.length);
    } catch {
      setSlotCount(0);
    }
  };

  useEffect(() => {
    getDoctorsAppointmentRequest();
    fetchSlotCount();
    fetchProfile();
    const refresh = setInterval(() => {
      getDoctorsAppointmentRequest();
      fetchSlotCount();
    }, 90000);
    return () => clearInterval(refresh);
  }, [fetchProfile]);

  const stats = useMemo(() => {
    const now = new Date();
    const active = appointments.filter(
      (a) => getAppointmentStatus(a, now) === "active"
    ).length;
    const upcoming = appointments.filter(
      (a) => getAppointmentStatus(a, now) === "upcoming"
    ).length;
    const incoming = callAlerts?.hasIncoming
      ? callAlerts.activeCalls?.length || 0
      : 0;

    return { active, upcoming, slotCount, incoming };
  }, [appointments, slotCount, callAlerts]);

  const toggleStatus = () => {
    const next = status === "Online" ? "Offline" : "Online";
    localStorage.setItem("onlineStatus", next);
    setStatus?.(next);
  };

  const remainingMinutes = (expiresAt) => {
    const diffMs = Math.max(0, (expiresAt || 0) - Date.now());
    return Math.ceil(diffMs / (60 * 1000));
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
      <WelcomeBack status={status} onAlertsChange={setCallAlerts} />

      <DoctorDashboardHeader
        userData={userData}
        status={status}
        onStatusToggle={toggleStatus}
        profileComplete={profileComplete}
        profileLoading={profileLoading}
      />

      <div className="space-y-3">
        {callAlerts?.rejoinData && (
          <DashboardAlert
            variant="info"
            title="Ongoing consultation"
            message={`Rejoin your call with ${callAlerts.rejoinData.call?.patientFirstName || "patient"} ${callAlerts.rejoinData.call?.patientLastName || ""} — ${remainingMinutes(callAlerts.rejoinData.expiresAt)} min left.`}
            primaryAction={
              <button
                type="button"
                onClick={callAlerts.onRejoin}
                className="rounded-lg bg-[#020e7c] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Rejoin in new tab
              </button>
            }
            secondaryAction={
              <button
                type="button"
                onClick={callAlerts.onDismissRejoin}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Dismiss
              </button>
            }
          />
        )}

        {callAlerts?.hasIncoming &&
          callAlerts.activeCalls?.map((call) => (
            <DashboardAlert
              key={call.callId}
              variant="call"
              title="Incoming patient call"
              message={`${call.patientFirstName || ""} ${call.patientLastName || ""} is waiting.${callAlerts.sseConnected ? "" : " (connecting live feed…)"}`}
              primaryAction={
                <button
                  type="button"
                  onClick={() => callAlerts.onIncomingClick(call.callId)}
                  className="shake rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Answer now
                </button>
              }
            />
          ))}

        {!profileLoading && !profileComplete && (
          <DashboardAlert
            variant="warning"
            title="Complete your profile to create slots"
            message={`Still needed: ${missingFields.join(", ")}`}
            primaryAction={
              <button
                type="button"
                onClick={() => navigate("/doctor-dashboard/edit-profile")}
                className="rounded-lg bg-[#020e7c] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Update profile
              </button>
            }
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard
          label="Join now"
          value={stats.active}
          hint="Appointments in session window"
          accent="green"
        />
        <StatCard
          label="Upcoming"
          value={stats.upcoming}
          hint="Scheduled with patients"
          accent="blue"
        />
        <StatCard
          label="Open slots"
          value={stats.slotCount}
          hint="Available on your calendar"
          accent="slate"
        />
        <StatCard
          label="Incoming"
          value={stats.incoming}
          hint="Patients waiting now"
          accent={stats.incoming > 0 ? "amber" : "slate"}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6">
        <div className="order-1 lg:col-span-2">
          <DashboardSection
            title="Appointment requests"
            subtitle="Join opens 5 minutes before start · stays open 45 minutes after"
            className="h-full"
            noPadding
          >
            <div className="max-h-[min(520px,60vh)] overflow-y-auto p-3 sm:p-4">
              <AppointmentRequests appointments={appointments} />
            </div>
          </DashboardSection>
        </div>
        <div className="order-2 lg:col-span-3">
          <Appointments />
        </div>
      </div>
    </div>
  );
}

export default LeftPanel;
