import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getId, getToken } from "../../utils";
import { useDispatch } from "react-redux";
import { setCall, setRoomUrl } from "../../features/authSlice";
import {
  joinScheduledAppointment,
  parseJoinError,
} from "../../utils/joinScheduledAppointment";
import {
  getAppointmentDateTime,
  getAppointmentStatus,
} from "../../utils/appointmentStatus";
import UpcomingAppointmentsList from "../appointments/UpcomingAppointmentsList";
import UpcomingAppointmentJoinModal from "../appointments/UpcomingAppointmentJoinModal";
import CancelAppointmentModal from "../appointments/CancelAppointmentModal";
import {
  cancelAppointment,
  parseCancelError,
} from "../../utils/cancelAppointment";

function AppointmentRequests({ appointments, onRefresh }) {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userId = userData.id;
  const dispatch = useDispatch();
  const getCurrentUserId = () => {
    const fresh = JSON.parse(localStorage.getItem("userData") || "{}");
    return Number(fresh?.id ?? sessionStorage.getItem("id") ?? userId);
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [reminderShown, setReminderShown] = useState(new Set());
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);
  const [currentUpcomingAppointment, setCurrentUpcomingAppointment] =
    useState(null);
  const [joiningSlotId, setJoiningSlotId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancellingSlotId, setCancellingSlotId] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!appointments?.length) return;

    const now = new Date();
    appointments.forEach((appointment) => {
      const status = getAppointmentStatus(appointment, now);
      const id = appointment.slotId;
      if (!id) return;

      if (status === "upcoming") {
        const dt = getAppointmentDateTime(appointment);
        if (!dt) return;
        const minutesUntil = Math.floor((dt.getTime() - now.getTime()) / 60000);
        if (
          minutesUntil <= 5 &&
          minutesUntil > 0 &&
          !reminderShown.has(`reminder-${id}`)
        ) {
          setReminderShown((prev) => new Set(prev).add(`reminder-${id}`));
          setCurrentUpcomingAppointment(appointment);
          setShowUpcomingModal(true);
        }
      }
    });
  }, [appointments, currentTime, reminderShown]);

  const handleJoinCall = async (appointment) => {
    const token = getToken();
    const slotId = appointment?.slotId;
    const patientId = appointment?.patientId;

    if (!userId || !slotId || !token) {
      toast.error("Missing required info to join call");
      return;
    }

    setJoiningSlotId(slotId);
    try {
      const { meetingUrl, usedSameTab } = await joinScheduledAppointment({
        slotId,
        userId,
        token,
        call: appointment,
        patientIdForStorage: patientId,
      });
      dispatch(setCall(appointment));
      dispatch(setRoomUrl(meetingUrl));
      toast.success(
        usedSameTab
          ? "Opening consultation in this tab."
          : "Opening consultation in a new tab.",
      );
    } catch (error) {
      console.error("Join call error:", error);
      toast.error(parseJoinError(error));
    } finally {
      setJoiningSlotId(null);
    }
  };

  const handleCloseUpcomingModal = () => {
    setShowUpcomingModal(false);
    setCurrentUpcomingAppointment(null);
  };

  const handleJoinFromUpcomingModal = async () => {
    if (!currentUpcomingAppointment) return;
    await handleJoinCall(currentUpcomingAppointment);
    handleCloseUpcomingModal();
  };

  const handleCancelConfirm = async (reason) => {
    const apt = cancelTarget;
    const token = getToken();
    const currentUserId = Number(getId() || getCurrentUserId());
    if (!apt?.slotId || !currentUserId || !token) return;

    setCancellingSlotId(apt.slotId);
    try {
      await cancelAppointment({
        slotId: apt.slotId,
        userId: currentUserId,
        reason,
        token,
      });
      toast.success("Appointment cancelled. The patient will see your reason.");
      setCancelTarget(null);
      onRefresh?.();
    } catch (error) {
      toast.error(parseCancelError(error));
    } finally {
      setCancellingSlotId(null);
    }
  };

  return (
    <>
      <UpcomingAppointmentsList
        appointments={appointments}
        loading={false}
        personPrefix=""
        emptyTitle="No appointment requests yet"
        emptyHint="Open slots on your calendar for patients to book."
        onJoin={handleJoinCall}
        isJoiningId={joiningSlotId}
        onCancel={(apt) => setCancelTarget(apt)}
        isCancellingId={cancellingSlotId}
      />

      <CancelAppointmentModal
        open={!!cancelTarget}
        appointment={cancelTarget}
        audience="doctor"
        onClose={() => !cancellingSlotId && setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        isSubmitting={!!cancellingSlotId}
      />

      <UpcomingAppointmentJoinModal
        open={showUpcomingModal}
        appointment={currentUpcomingAppointment}
        counterpartLabel="your patient"
        onDismiss={handleCloseUpcomingModal}
        onJoin={handleJoinFromUpcomingModal}
        isJoining={!!joiningSlotId}
        variant={
          currentUpcomingAppointment &&
          getAppointmentStatus(currentUpcomingAppointment, currentTime) ===
            "active"
            ? "active"
            : "reminder"
        }
      />
    </>
  );
}

export default AppointmentRequests;
