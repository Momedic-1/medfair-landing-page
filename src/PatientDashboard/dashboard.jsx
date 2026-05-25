import { useEffect, useState } from "react";
import PatientDashboardTop from "./PatientDashboardTop";
// import testTube from "../assets/test.jpeg"
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Modal, Box, Button } from "@mui/material";
import PatientBookingModals from "./components/PatientBookingModals";
import CallDoctorModal from "./components/CallDoctorModal";
import { confirmModalSx } from "./components/bookingModalStyles";
import { baseUrl } from "../env";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ColorRing } from "react-loader-spinner";
import { formatTime, getId, getToken, transformName } from "../utils";
import {
  isSlotDateTimeExpired,
  nowInBookingZone,
  slotWithDate,
} from "../utils/slotDateTime";
import { normalizeSpecialistSlotGroups } from "../utils/normalizeSpecialistSlots";
import {
  enrichSpecialistWithSlots,
  flattenSpecialistsFromApi,
} from "../utils/fetchDoctorForPatient";
import { openVideoCallInNewTab } from "../utils/videoCallNavigation";
import { parseApiError } from "../utils/parseApiError";
import {
  clearPatientGpCall,
  isPatientGpCallActive,
  loadPatientGpCall,
  savePatientGpCall,
} from "../utils/patientGpCall";
import {
  joinScheduledAppointment,
  parseJoinError,
} from "../utils/joinScheduledAppointment";
import {
  getAppointmentDateTime,
  getAppointmentStatus,
} from "../utils/appointmentStatus";
import UpcomingAppointmentsList from "../components/appointments/UpcomingAppointmentsList";
import UpcomingAppointmentJoinModal from "../components/appointments/UpcomingAppointmentJoinModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const localizer = dayjsLocalizer(dayjs);

// Custom calendar styles
const calendarStyle = {
  height: 520,
  minHeight: 480,
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontSize: "14px",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  overflow: "hidden",
};

const CALL_WAIT_TIMEOUT_MS = 5 * 60 * 1000;

const specialistCategory = [
  {
    id: 1,
    name: "General Practitioner",
    count: 0,
    icon: "🩺",
    specialization: "GENERAL_PRACTITIONER",
  },
  {
    id: 2,
    name: "Mental Health Specialist",
    count: 0,
    icon: "🧠",
    specialization: "MENTAL_HEALTH_SPECIALIST",
  },
  {
    id: 3,
    name: "Clinical Psychologist",
    count: 0,
    icon: "🎯",
    specialization: "CLINICAL_PSYCHOLOGIST",
  },
  {
    id: 4,
    name: "Relationship Therapist",
    count: 0,
    icon: "💑",
    specialization: "RELATIONSHIP_THERAPIST",
  },
  {
    id: 5,
    name: "Urologist",
    count: 0,
    icon: "🫁",
    specialization: "UROLOGIST",
  },
  {
    id: 6,
    name: "Ear, Nose, and Throat Specialist",
    count: 0,
    icon: "👂🏼",
    specialization: "EAR_NOSE_THROAT_SPECIALIST",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userId = userData.id;
  const [isLoading, setIsLoading] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [joiningSlotId, setJoiningSlotId] = useState(null);
  const [specialistsLoading, setSpecialistsLoading] = useState(false);
  const [specialistCategories, setSpecialistCategories] =
    useState(specialistCategory);
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [isSpecialistsModalOpen, setIsSpecialistsModalOpen] = useState(false);
  const [isCallADoctorModalOpen, setIsCallADoctorModalOpen] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]); // New state for calendar events
  const [videoLink, setVideoLink] = useState(null);
  const [videoMeetingUrl, setVideoMeetingUrl] = useState(null);
  const [specialistDetails, setSpecialistDetails] = useState([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const token = getToken();
  const [isBooking, setIsBooking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [meetingUrlGenerated, setMeetingUrlGenerated] = useState(new Set());
  const [notificationShown, setNotificationShown] = useState(new Set());
  const [bookedSlots, setBookedSlots] = useState(new Set());
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(null);
  const [subscriptionMessage, setSubscriptionMessage] = useState(""); // store API message
  const [currentUpcomingAppointment, setCurrentUpcomingAppointment] =
    useState(null);
  const [activeMeeting, setActiveMeeting] = useState(null); // persisted quick-call meeting
  const [isCancelCallConfirmOpen, setIsCancelCallConfirmOpen] = useState(false);
  const [callStatus, setCallStatus] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [currentCallId, setCurrentCallId] = useState(null);

  const patientId = getId();

  const CREATE_MEETING = `${baseUrl}/api/v1/video/create-meeting`;
  const GETSPECIALISTCOUNTURL = `${baseUrl}/api/appointments/specialists/appointments-count`;
  const GETSPECIALISTDATA = `${baseUrl}/api/appointments/specialists/slots`;
  const GETUPCOMINGAPPOINTMENTS = `${baseUrl}/api/appointments/upcoming/patient`;
  const BOOK_APPOINTMENT_URL = `${baseUrl}/api/appointments/book`;

  // Custom event style getter for calendar
  const eventStyleGetter = (event, start, end, isSelected) => {
    const now = new Date();
    const eventStart = new Date(start);
    const isUpcoming = eventStart > now;
    const isToday = dayjs(eventStart).isSame(dayjs(now), "day");

    let backgroundColor = "#3174ad";
    let borderColor = "#3174ad";

    if (!isUpcoming) {
      backgroundColor = "#6b7280"; // gray for past appointments
      borderColor = "#6b7280";
    } else if (isToday) {
      backgroundColor = "#10b981"; // green for today's appointments
      borderColor = "#10b981";
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: 0.9,
        color: "white",
        border: `1px solid ${borderColor}`,
        fontSize: "12px",
        fontWeight: "500",
        padding: "2px 6px",
      },
    };
  };

  // Custom calendar components
  const CustomEvent = ({ event }) => (
    <div className="text-[11px] font-medium leading-snug">
      <div className="font-semibold line-clamp-2">Dr. {event.doctorName}</div>
      <div className="mt-0.5 opacity-90">{event.time}</div>
    </div>
  );

  // Transform appointments to calendar events
  const transformAppointmentsToEvents = (appointments) => {
    return (appointments || [])
      .map((appointment) => {
        const startDate = getAppointmentDateTime(appointment);
        if (!startDate || Number.isNaN(startDate.getTime())) return null;

        const endDate = new Date(startDate.getTime() + 30 * 60000);
        const doctorLabel = appointment.name || "Specialist";

        return {
          id: appointment.slotId || appointment.id,
          title: `Dr. ${doctorLabel}`,
          start: startDate,
          end: endDate,
          doctorName: doctorLabel,
          time: formatTime(appointment.time),
          resource: appointment,
        };
      })
      .filter(Boolean);
  };

  // Handle calendar event click
  const handleEventClick = (event) => {
    const appointment = event.resource;
    const status = getAppointmentStatus(appointment);

    if (status === "active") {
      handleJoinCall(appointment.slotId);
    } else {
      toast.info(
        `Appointment with Dr. ${appointment.name} on ${appointment.date
        } at ${formatTime(appointment.time)}`
      );
    }
  };

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Generate meeting URL (call 5 minutes before)
  const generateMeetingUrl = async (slotId) => {
    const token = getToken();
    if (!userId || !slotId || !token) {
      return;
    }

    if (meetingUrlGenerated.has(slotId)) {
      console.log("URL already generated for this slot");
      return;
    }

    try {
      setIsLoading(true);
      const url = `${baseUrl}/api/appointment/meetings/${slotId}/users/${userId}/url`;

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const meetingUrl = response.data.meetingUrl || response.data.url;
      setVideoMeetingUrl(meetingUrl);
      setMeetingUrlGenerated((prev) => new Map(prev).set(slotId, meetingUrl));
      toast.success("Meeting URL generated! You can join when ready.");
    } catch (error) {
      console.error("Generate URL error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Quick-call rejoin helpers ---
  const ACTIVE_MEETING_KEY = "activeMeeting";

  const loadActiveMeetingFromStorage = () => {
    try {
      const raw = localStorage.getItem(ACTIVE_MEETING_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.roomUrl || !parsed?.expiresAt) return null;
      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem(ACTIVE_MEETING_KEY);
        return null;
      }
      return parsed;
    } catch (_e) {
      return null;
    }
  };

  const saveActiveMeetingToStorage = (roomUrl, durationMinutes = 40) => {
    const expiresAt = Date.now() + durationMinutes * 60 * 1000;
    const payload = { roomUrl, expiresAt };
    localStorage.setItem(ACTIVE_MEETING_KEY, JSON.stringify(payload));
    setActiveMeeting(payload);
  };

  const clearActiveMeeting = () => {
    localStorage.removeItem(ACTIVE_MEETING_KEY);
    setActiveMeeting(null);
  };

  // Initialize active meeting from storage on mount
  useEffect(() => {
    const stored = loadActiveMeetingFromStorage();
    if (stored) setActiveMeeting(stored);
  }, []);

  // Restore in-progress GP call (prevents duplicate "Start call")
  useEffect(() => {
    const storedCall = loadPatientGpCall();
    if (!storedCall?.callId || !token) return;

    if (storedCall.status !== "WAITING") return;

    const callId = storedCall.callId;
    setCurrentCallId(callId);
    setCallStatus("WAITING");
    if (storedCall.roomUrl) {
      setVideoLink({ roomUrl: storedCall.roomUrl, meetingId: callId });
    }

    if (pollingInterval) return undefined;

    const waitStartedAt = storedCall.startedAt || Date.now();
    const interval = setInterval(async () => {
      const status = await pollCallStatus(callId);
      if (status === "DOCTOR_JOINED") {
        clearInterval(interval);
        setPollingInterval(null);
        savePatientGpCall({
          callId,
          roomUrl: storedCall.roomUrl,
          status: "IN_CALL",
        });
        if (storedCall.roomUrl) {
          saveActiveMeetingToStorage(storedCall.roomUrl, 40);
          openVideoCallInNewTab(storedCall.roomUrl);
        }
        setIsCallADoctorModalOpen(false);
        setCallStatus(null);
        clearPatientGpCall();
      } else if (
        status === "ENDED" ||
        Date.now() - waitStartedAt >= CALL_WAIT_TIMEOUT_MS
      ) {
        clearInterval(interval);
        setPollingInterval(null);
        setCallStatus("NO_DOCTOR");
        clearPatientGpCall();
      }
    }, 3000);
    setPollingInterval(interval);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Reaper to clear expired active meetings
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = loadActiveMeetingFromStorage();
      if (!stored && activeMeeting) {
        setActiveMeeting(null);
      }
    }, 30000); // check every 30s
    return () => clearInterval(interval);
  }, [activeMeeting]);

  const handleJoinCall = async (appointment) => {
    const slotId = appointment?.slotId ?? appointment;
    const token = getToken();
    if (!userId || !slotId || !token) {
      toast.error("Missing required info to join call");
      return;
    }

    setJoiningSlotId(slotId);
    try {
      const callPayload =
        typeof appointment === "object"
          ? { ...appointment, slotId }
          : { slotId };

      const { meetingUrl, opened, blocked } = await joinScheduledAppointment({
        slotId,
        userId,
        token,
        call: callPayload,
        patientIdForStorage: patientId,
      });
      setVideoMeetingUrl(meetingUrl);

      try {
        localStorage.setItem(
          "activeCall",
          JSON.stringify({
            call: callPayload,
            joinRoomUrl: meetingUrl,
            patientId,
            expiresAt: Date.now() + 40 * 60 * 1000,
          })
        );
      } catch {
        // ignore
      }
      const stored = loadActiveMeetingFromStorage();
      if (stored) setActiveMeeting(stored);

      if (blocked) {
        toast.warn(
          "Allow pop-ups for this site, then click Join again. Your dashboard will stay here."
        );
      } else if (opened) {
        toast.success("Video call opened in a new tab — you can stay on this page.");
      }
    } catch (error) {
      console.error("Join call error:", error);
      toast.error(parseJoinError(error));
    } finally {
      setJoiningSlotId(null);
    }
  };

  const joinMeeting = async (slotId) => {
    const storedUrl = meetingUrlGenerated.get(slotId);
    if (storedUrl) {
      setVideoMeetingUrl(storedUrl);
      setShowModal(true);
      return;
    }

    await generateMeetingUrl(slotId);
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

  const handleCardClick = (title) => {
    if (title === "Schedule an Appointment") {
      setIsMainModalOpen(true);
    }
  };

  const handleCallADoctorClick = async () => {
    setIsCallADoctorModalOpen(true);
  };

  const handleCategoryClick = (categoryId) => {
    const category = specialistCategories.find((cat) => cat.id === categoryId);
    setSelectedCategoryName(category?.name || "");
    getSpecialistsDetails(category.name);
    setIsMainModalOpen(false);
    setIsSpecialistsModalOpen(true);
  };

  const clearCallPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const handleOpenBookFromCall = () => {
    clearCallPolling();
    setIsCallADoctorModalOpen(false);
    setCallStatus(null);
    setCurrentCallId(null);
    setVideoLink(null);
    setIsMainModalOpen(true);
  };

  const handleTryCallAgain = () => {
    clearCallPolling();
    clearPatientGpCall();
    setCallStatus(null);
    setCurrentCallId(null);
    setVideoLink(null);
  };

  const handleConfirmBooking = (e, slotId) => {
    handleBookAppointment(e, slotId, patientId);
  };

  const handleBookAppointment = async (e, slotId, patientId) => {
    e.preventDefault();
    setIsBooking(true);
    try {
      const response = await axios.post(
        `${BOOK_APPOINTMENT_URL}?slotId=${slotId}&patientId=${patientId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response);
      toast.success("Appointment booked successfully!");

      setBookedSlots((prev) => new Set(prev).add(slotId));

      setIsSpecialistsModalOpen(false);
      setIsMainModalOpen(false);

      await getUpcomingAppointments();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to book appointment";
      toast.error(errorMessage);

      setBookedSlots((prev) => {
        const newSet = new Set(prev);
        newSet.delete(slotId);
        return newSet;
      });
    } finally {
      setIsBooking(false);
    }
  };

  const getSpecialistCount = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(GETSPECIALISTCOUNTURL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const countData = response?.data || {};

      const normalizedCountData = Object.keys(countData).reduce((acc, key) => {
        acc[key.toUpperCase()] = countData[key];
        return acc;
      }, {});
      const updatedCategories = specialistCategories.map((category) => ({
        ...category,
        count: normalizedCountData[category.specialization] || 0,
      }));

      setSpecialistCategories(updatedCategories);
    } catch (error) {
      // console.error("Error fetching specialist count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortSlotsByTime = (specialists) => {
    return specialists.map((specialist) => {
      const withGroups = normalizeSpecialistSlotGroups(specialist);
      return {
        ...withGroups,
        slotGroups: withGroups.slotGroups?.map((slotGroup) => ({
          ...slotGroup,
          slots: slotGroup.slots
            ?.map((s) => slotWithDate(s, slotGroup.date))
            ?.sort((a, b) => {
              const timeA = dayjs(`${a.date}T${a.time}`);
              const timeB = dayjs(`${b.date}T${b.time}`);
              return timeA.isBefore(timeB) ? -1 : timeA.isAfter(timeB) ? 1 : 0;
            }),
        })),
      };
    });
  };

  const getSpecialistsDetails = async (categoryName) => {
    setSpecialistsLoading(true);
    try {
      const transformedName = transformName(categoryName);
      const response = await axios.get(
        `${GETSPECIALISTDATA}?specialization=${transformedName}&_=${Date.now()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const specialists = flattenSpecialistsFromApi(response?.data);

      const enriched = await Promise.all(
        specialists.map((spec) =>
          enrichSpecialistWithSlots(spec, transformedName, token)
        )
      );

      setSpecialistDetails(sortSlotsByTime(enriched));
    } catch (error) {
      toast.error("Could not load specialists. Please try again.");
    } finally {
      setSpecialistsLoading(false);
    }
  };

  const getUpcomingAppointments = async () => {
    if (!patientId || !token) return;
    setAppointmentsLoading(true);
    try {
      const response = await axios.get(
        `${GETUPCOMINGAPPOINTMENTS}/${patientId}?_=${Date.now()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const formattedData = response.data || [];
      setUpcomingAppointments(formattedData);
      setCalendarEvents(transformAppointmentsToEvents(formattedData));
    } catch (error) {
      console.log("Error fetching upcoming appointments:", error);
      toast.error("Could not load your appointments.");
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const pollCallStatus = async (callId) => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/v1/video/${callId}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.status;
    } catch (error) {
      console.error("Error polling call status:", error);
      return null;
    }
  };

  const createMeeting = async () => {
    if (callStatus === "WAITING" || isPatientGpCallActive()) {
      toast.info(
        "You already have an active call. Cancel it or wait for a doctor before starting another.",
      );
      setIsCallADoctorModalOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      if (!patientId) {
        throw new Error("Patient ID not found");
      }

      const response = await axios.post(
        `${CREATE_MEETING}?patientId=${patientId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setVideoLink(response.data);

      // Extract meetingId (which is the callId)
      const callId = response.data.meetingId;

      if (!callId) {
        throw new Error("Meeting ID not found in response");
      }

      setCurrentCallId(callId);
      setCallStatus("WAITING");
      savePatientGpCall({
        callId,
        roomUrl: response.data?.roomUrl,
        status: "WAITING",
      });

      const waitStartedAt = Date.now();

      // Start polling for doctor join
      const interval = setInterval(async () => {
        const status = await pollCallStatus(callId);

        if (status === "DOCTOR_JOINED") {
          setCallStatus("DOCTOR_JOINED");
          clearInterval(interval);
          setPollingInterval(null);
          savePatientGpCall({
            callId,
            roomUrl: response.data?.roomUrl,
            status: "IN_CALL",
          });

          if (response.data?.roomUrl) {
            saveActiveMeetingToStorage(response.data.roomUrl, 40);
            const { blocked } = openVideoCallInNewTab(response.data.roomUrl);
            if (blocked) {
              toast.warn(
                "Allow pop-ups to open the call in a new tab. This page will stay on your dashboard."
              );
            }
            toast.success("Call opened in a new tab.");
          }
          setIsCallADoctorModalOpen(false);
          setCallStatus(null);
          clearPatientGpCall();
        } else if (
          status === "ENDED" ||
          Date.now() - waitStartedAt >= CALL_WAIT_TIMEOUT_MS
        ) {
          clearInterval(interval);
          setPollingInterval(null);
          setCallStatus("NO_DOCTOR");
          clearPatientGpCall();
        }
      }, 3000);

      setPollingInterval(interval);
      return response.data;
    } catch (err) {
      console.error("Create meeting error:", err);
      toast.error(
        parseApiError(err, "Failed to create meeting. Please try again in a moment."),
      );
      setCallStatus(null);
      clearPatientGpCall();
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Handle cancel waiting - shows confirmation modal
  const handleCancelWaiting = () => {
    if (!currentCallId) {
      toast.info("No active call to cancel");
      setIsCallADoctorModalOpen(false);
      return;
    }
    setIsCancelCallConfirmOpen(true);
  };

  // Confirm and actually cancel the call
  const confirmCancelCall = async () => {
    if (!currentCallId) {
      toast.info("No active call to cancel");
      setIsCancelCallConfirmOpen(false);
      setIsCallADoctorModalOpen(false);
      return;
    }

    try {
      setIsLoading(true);

      // Call the API to end the call
      await axios.post(
        `${baseUrl}/api/v1/video/end-call-by-patient/${currentCallId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Clean up polling interval
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }

      // Reset call-related state
      setCallStatus(null);
      setCurrentCallId(null);
      setVideoLink(null);
      clearPatientGpCall();
      setIsCallADoctorModalOpen(false);
      setIsCancelCallConfirmOpen(false);

      toast.success("Call cancelled successfully");
    } catch (error) {
      console.error("Error cancelling call:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to cancel call";
      toast.error(errorMessage);

      // Still clean up local state even if API call fails
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      setCallStatus(null);
      setCurrentCallId(null);
      setVideoLink(null);
      clearPatientGpCall();
      setIsCallADoctorModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();

    upcomingAppointments.forEach((appointment) => {
      const id = appointment.slotId;
      if (!id) return;

      const status = getAppointmentStatus(appointment, now);
      const dt = getAppointmentDateTime(appointment);
      if (!dt) return;

      if (status === "upcoming") {
        const minutesUntil = Math.floor((dt.getTime() - now.getTime()) / 60000);
        if (
          minutesUntil <= 5 &&
          minutesUntil > 0 &&
          !notificationShown.has(id)
        ) {
          setNotificationShown((prev) => new Set(prev).add(id));
          setCurrentUpcomingAppointment(appointment);
          setShowUpcomingModal(true);
        }
      }

      if (status === "active" && !notificationShown.has(`active-${id}`)) {
        setNotificationShown((prev) => new Set(prev).add(`active-${id}`));
        setCurrentUpcomingAppointment(appointment);
        setShowUpcomingModal(true);
      }
    });
  }, [currentTime, upcomingAppointments, notificationShown]);

  const checkSubscriptionStatus = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/subscription/status/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setHasSubscription(response.data.subscribed); // boolean
      setSubscriptionMessage(response.data.message || ""); // message
    } catch (error) {
      console.error("Error checking subscription:", error);
      setHasSubscription(false);
      setSubscriptionMessage(
        "Unable to check subscription status. Please try again."
      );
    }
  };

  useEffect(() => {
    if (userId && token) {
      checkSubscriptionStatus();
    }
  }, [userId, token]);

  useEffect(() => {
    const currentSlotIds = new Set(
      upcomingAppointments.map((apt) => apt.slotId)
    );
    setNotificationShown((prev) => {
      const filtered = new Set();
      prev.forEach((slotId) => {
        if (currentSlotIds.has(slotId)) {
          filtered.add(slotId);
        }
      });
      return filtered;
    });
  }, [upcomingAppointments]);

  useEffect(() => {
    getSpecialistCount();
  }, []);

  useEffect(() => {
    getUpcomingAppointments();
    const refresh = setInterval(getUpcomingAppointments, 90000);
    return () => clearInterval(refresh);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const bookedSlotIds = upcomingAppointments
      .map((apt) => apt.slotId)
      .filter(Boolean);

    setBookedSlots(new Set(bookedSlotIds));
  }, [upcomingAppointments]);

  const isSlotBooked = (slotId) => {
    return bookedSlots.has(slotId) || isSlotBookedFromAppointments(slotId);
  };

  const cleanupOldBookedSlots = () => {
    const today = dayjs();
    const validSlotIds = upcomingAppointments
      .filter((apt) => dayjs(apt.date).isAfter(today.subtract(1, "day")))
      .map((apt) => apt.slotId);

    setBookedSlots(new Set(validSlotIds));
  };

  useEffect(() => {
    cleanupOldBookedSlots();
  }, []);

  const isSlotBookedFromAppointments = (slotId) => {
    return upcomingAppointments.some((apt) => apt.slotId === slotId);
  };

  const handleRoute = () => {
    navigate("/patient-dashboard/patient-investigations");
  };

  const isSlotExpired = (slot) =>
    isSlotDateTimeExpired(slot, nowInBookingZone());

  return (
    <div className="w-full">
      <ToastContainer />

      {/* Custom Calendar Styles */}
      <style jsx>{`
        .rbc-calendar {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .rbc-header {
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          color: #374151;
          padding: 12px 8px;
          font-size: 14px;
        }
        .rbc-month-view {
          border: none;
        }
        .rbc-date-cell {
          overflow-y: auto;
          padding: 8px 4px;
          font-size: 13px;
          color: #6b7280;
        }
        .rbc-date-cell.rbc-off-range {
          color: #d1d5db;
        }
        .rbc-today {
          background-color: #dbeafe !important;
        }
        .rbc-day-bg.rbc-today {
          background-color: #dbeafe;
        }
        .rbc-month-row {
          border-bottom: 1px solid #f3f4f6;
        }
        .rbc-date-cell + .rbc-date-cell {
          border-left: 1px solid #f3f4f6;
        }
        .rbc-month-view .rbc-row-content {
          min-height: 88px;
        }
        .rbc-month-view .rbc-date-cell {
          min-height: 72px;
          vertical-align: top;
        }
        .rbc-event {
          border-radius: 6px;
          font-size: 11px;
          line-height: 1.35;
          margin: 2px 1px;
          padding: 4px 6px;
          min-height: 40px;
          cursor: pointer;
          transition: all 0.2s ease;
          overflow: visible !important;
          white-space: normal !important;
        }
        .rbc-event-content {
          white-space: normal !important;
          overflow: visible !important;
        }
        .rbc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .rbc-show-more {
          color: #3b82f6;
          font-size: 11px;
          font-weight: 500;
        }
        .rbc-toolbar {
          padding: 16px;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }
        .rbc-toolbar button {
          background: white;
          border: 1px solid #d1d5db;
          color: #374151;
          padding: 6px 12px;
          overflow-y: scroll;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
        }
        .rbc-toolbar button:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
        .rbc-toolbar button.rbc-active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }
        .rbc-toolbar-label {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }
      `}</style>

      <div className="w-full px-2 py-4 sm:px-4 sm:py-6">
        <PatientDashboardTop
          userData={userData}
          hasSubscription={hasSubscription}
          subscriptionMessage={subscriptionMessage}
          activeMeeting={activeMeeting}
          videoMeetingUrl={videoMeetingUrl}
          showMeetingModal={showModal}
          upcomingAppointments={upcomingAppointments}
          isLoading={isLoading}
          onCallDoctor={handleCallADoctorClick}
          onScheduleAppointment={() =>
            handleCardClick("Schedule an Appointment")
          }
          onNavigateSubscription={() =>
            navigate("/patient-dashboard/subscription")
          }
          onDismissMeetingChip={() => setShowModal(false)}
          getAppointmentStatus={getAppointmentStatus}
          formatTime={formatTime}
          onJoinAppointment={handleJoinCall}
        />

        <div className="mt-6 flex flex-col gap-6 xl:flex-row">
          <div className="flex w-full flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm xl:w-[68%]">
            <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
              <h2 className="text-base font-bold text-[#020e7c] sm:text-lg">
                Appointments calendar
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                View and manage your scheduled visits
              </p>
            </div>
            <div className="flex flex-1 flex-col p-3 sm:p-4">

            <div className="flex-1">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleEventClick}
                eventPropGetter={eventStyleGetter}
                components={{ event: CustomEvent }}
                style={calendarStyle}
                views={["month", "week", "day"]}
                defaultView="month"
                popup={true}
                popupOffset={30}
                messages={{
                  next: "Next",
                  previous: "Prev",
                  today: "Today",
                  month: "Month",
                  week: "Week",
                  day: "Day",
                }}
              />

              {calendarEvents.length === 0 && !isLoading && (
                <div className="text-center text-gray-500 pt-4">
                  <p className="text-lg mb-2">📅 No appointments scheduled</p>
                  <p className="text-sm">
                    Book an appointment with a specialist to see it here
                  </p>
                </div>
              )}
            </div>
            </div>
          </div>

          <div className="flex w-full flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm xl:w-[32%]">
            <div className="border-b border-gray-100 px-4 py-4">
              <h2 className="text-base font-bold text-[#020e7c] sm:text-lg">
                Your appointments
              </h2>
              <p className="text-sm text-gray-500">
                Join opens 5 minutes before start time
              </p>
            </div>
            <div className="max-h-[480px] flex-1 overflow-y-auto p-3 sm:p-4">
              <UpcomingAppointmentsList
                appointments={upcomingAppointments}
                loading={appointmentsLoading}
                personPrefix="Dr."
                emptyTitle="No upcoming appointments"
                emptyHint="Schedule a specialist visit to see it here."
                onJoin={handleJoinCall}
                isJoiningId={joiningSlotId}
              />
            </div>
          </div>
        </div>
      </div>

      <PatientBookingModals
        isMainModalOpen={isMainModalOpen}
        setIsMainModalOpen={setIsMainModalOpen}
        isSpecialistsModalOpen={isSpecialistsModalOpen}
        setIsSpecialistsModalOpen={setIsSpecialistsModalOpen}
        specialistCategories={specialistCategories}
        specialistDetails={specialistDetails}
        selectedCategoryName={selectedCategoryName}
        isLoading={specialistsLoading}
        onCategoryClick={handleCategoryClick}
        onBackToCategories={() => {
          setIsSpecialistsModalOpen(false);
          setIsMainModalOpen(true);
        }}
        onBookAppointment={handleConfirmBooking}
        bookedSlots={bookedSlots}
        isBooking={isBooking}
        isSlotBooked={isSlotBooked}
        isSlotExpired={isSlotExpired}
      />

      <CallDoctorModal
        open={isCallADoctorModalOpen}
        callStatus={callStatus}
        videoLink={videoLink}
        isLoading={isLoading}
        onClose={() => setIsCallADoctorModalOpen(false)}
        onCreateMeeting={createMeeting}
        onCancelWaiting={handleCancelWaiting}
        onBookAppointment={handleOpenBookFromCall}
        onTryAgain={handleTryCallAgain}
      />

      {/* Cancel Call Confirmation Modal */}
      <Modal
        open={isCancelCallConfirmOpen}
        onClose={() => setIsCancelCallConfirmOpen(false)}
        aria-labelledby="cancel-call-confirm-title"
      >
        <Box sx={confirmModalSx}>
          <div className="flex flex-col gap-4">
            <h2
              id="cancel-call-confirm-title"
              className="text-xl font-semibold text-gray-900"
            >
              Cancel Call?
            </h2>
            <p className="text-gray-600">
              Are you sure you want to end this call? This action cannot be
              undone.
            </p>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                variant="outlined"
                onClick={() => setIsCancelCallConfirmOpen(false)}
                disabled={isLoading}
              >
                No, Keep Waiting
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={confirmCancelCall}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ColorRing
                    height="20"
                    width="20"
                    ariaLabel="color-ring-loading"
                    wrapperStyle={{}}
                    wrapperClass="color-ring-wrapper"
                    colors={["white", "white", "white", "white", "white"]}
                  />
                ) : (
                  "Yes, End Call"
                )}
              </Button>
            </div>
          </div>
        </Box>
      </Modal>

      <UpcomingAppointmentJoinModal
        open={showUpcomingModal}
        appointment={
          currentUpcomingAppointment
            ? {
                ...currentUpcomingAppointment,
                name: `Dr. ${currentUpcomingAppointment.name || ""}`.trim(),
              }
            : null
        }
        counterpartLabel="your doctor"
        onDismiss={handleCloseUpcomingModal}
        onJoin={handleJoinFromUpcomingModal}
        isJoining={!!joiningSlotId}
        variant={
          currentUpcomingAppointment &&
          getAppointmentStatus(currentUpcomingAppointment) === "active"
            ? "active"
            : "reminder"
        }
      />
    </div>
  );
};

export default Dashboard;
