import { useEffect, useState } from "react";
import Cards from "../components/reuseables/Cards";
import call from "./assets/call (2).svg";
import calendarIcon from "../assets/calendarIcon.jpeg";
import testTube from "../assets/test.jpeg";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Modal,
  Box,
  List,
  ListItem,
  ListItemButton,
  Avatar,
  Button,
  Popover,
} from "@mui/material";
import { baseUrl } from "../env";
import axios from "axios";
import { Link } from "react-router-dom";
import { ColorRing } from "react-loader-spinner";
import {
  formatSpecialization,
  formatTime,
  getId,
  getToken,
  transformName,
} from "../utils";
import Skeleton from "react-loading-skeleton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-loading-skeleton/dist/skeleton.css";
import { PiStethoscope } from "react-icons/pi";
import { LiaPhoneVolumeSolid } from "react-icons/lia";

const localizer = dayjsLocalizer(dayjs);
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "650px",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
  overflowY: "auto",
  maxHeight: "90vh",
};

const avatarStyle = {
  width: 100,
  height: 100,
};

const avatarStyle2 = {
  width: 35,
  height: 35,
};

const specialistCategory = [
  {
    id: 1,
    name: "Mental Health Specialist",
    count: 0,
    icon: "🧠",
    specialization: "MENTAL_HEALTH_SPECIALIST",
  },
  {
    id: 2,
    name: "Clinical Psychologist",
    count: 0,
    icon: "🎯",
    specialization: "CLINICAL_PSYCHOLOGIST",
  },
  {
    id: 3,
    name: "Relationship Therapist",
    count: 0,
    icon: "💭",
    specialization: "RELATIONSHIP_THERAPIST",
  },
  {
    id: 4,
    name: "Sex Therapist",
    count: 0,
    icon: "❤️",
    specialization: "SEX_THERAPIST",
  },
];
const Dashboard = () => {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userId = userData.id;
  const [isLoading, setIsLoading] = useState(false);
  const [specialistCategories, setSpecialistCategories] =
    useState(specialistCategory);
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [isSpecialistsModalOpen, setIsSpecialistsModalOpen] = useState(false);
  const [isCallADoctorModalOpen, setIsCallADoctorModalOpen] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [videoLink, setVideoLink] = useState(null);
  // const [meetingLink, setMeetingLink] = useState(null);
  const [videoMeetingUrl, setVideoMeetingUrl] = useState(null);
  const [specialistDetails, setSpecialistDetails] = useState([]);
  const token = getToken();
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [meetingUrlGenerated, setMeetingUrlGenerated] = useState(new Set());
  const [notificationShown, setNotificationShown] = useState(new Set());
  const [bookedSlots, setBookedSlots] = useState(new Set());
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);
  const [currentUpcomingAppointment, setCurrentUpcomingAppointment] =
    useState(null);

  const patientId = getId();

  const CREATE_MEETING = `${baseUrl}/api/v1/video/create-meeting`;
  const GETSPECIALISTCOUNTURL = `${baseUrl}/api/appointments/specialists/appointments-count`;
  const GETSPECIALISTDATA = `${baseUrl}/api/appointments/specialists/slots`;
  const GETUPCOMINGAPPOINTMENTS = `${baseUrl}/api/appointments/upcoming/patient`;
  const BOOK_APPOINTMENT_URL = `${baseUrl}/api/appointments/book`;
  // const BOOK_MEETING_URL = `${baseUrl}//api/appointment/meetings`;

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Get appointment status based on current time
  const getAppointmentStatus = (appointment) => {
    if (!appointment.date || !appointment.time) return "unknown";

    const now = new Date();
    const appointmentDateTime = new Date(
      `${appointment.date}T${appointment.time}`
    );
    const timeDiff = now.getTime() - appointmentDateTime.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (minutesDiff > 45) {
      return "over"; // More than 30 minutes past appointment time
    } else if (minutesDiff >= -5 && minutesDiff <= 30) {
      return "active"; // 5 minutes before to 30 minutes after
    } else {
      return "upcoming"; // More than 5 minutes before
    }
  };

  // Get status-based styling
  const getStatusColor = (status) => {
    switch (status) {
      case "over":
        return "bg-red-100 border-red-300";
      case "active":
        return "bg-green-100 border-green-300";
      case "upcoming":
        return "bg-blue-100 border-blue-300";
      default:
        return "bg-gray-100";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "over":
        return "⏰ Appointment Over";
      case "active":
        return "🟢 Active";
      case "upcoming":
        return "⏳ Upcoming";
      default:
        return "";
    }
  };

  // Generate meeting URL (call 5 minutes before)
  const generateMeetingUrl = async (slotId) => {
    const token = getToken();
    if (!userId || !slotId || !token) {
      // toast.error("Missing required info to generate meeting URL");
      return;
    }

    // Check if URL already exists in state
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

      // Store the URL with the slotId
      const meetingUrl = response.data.meetingUrl || response.data.url;
      setVideoMeetingUrl(meetingUrl);
      setMeetingUrlGenerated((prev) => new Map(prev).set(slotId, meetingUrl));
      toast.success("Meeting URL generated! You can join when ready.");
    } catch (error) {
      console.error("Generate URL error:", error);
      // toast.error("Failed to generate meeting URL");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCall = async (slotId) => {
    const token = getToken();
    if (!userId || !slotId || !token) {
      toast.error("Missing required info to join call");
      return;
    }
  
    try {
      setIsLoading(true);
  
      // Get the meeting URL
      const getUrl = `${baseUrl}/api/appointment/meetings/${slotId}/users/${userId}/url`;
      const getResponse = await axios.get(getUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const meetingUrl = getResponse.data.meetingUrl;
      if (!meetingUrl) {
        throw new Error("Meeting URL not available");
      }
  
      setVideoMeetingUrl(meetingUrl);
  
      // Join the meeting
      const postUrl = `${baseUrl}/api/appointment/meetings/${slotId}/users/${userId}/join`;
      await axios.post(
        postUrl,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      toast.success("Joined call successfully!");
      setShowModal(true);
    } catch (error) {
      console.error("Join call error:", error);
      const errorMessage =
        error?.response?.data?.message || "Failed to join call";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const joinMeeting = async (slotId) => {
    const storedUrl = meetingUrlGenerated.get(slotId);
    if (storedUrl) {
      setVideoMeetingUrl(storedUrl);
      setShowModal(true);
      // toast.success("Joining meeting...");
      return;
    }

    // If no stored URL, generate one first
    await generateMeetingUrl(slotId);
  };

  // Handle upcoming modal actions
  const handleCloseUpcomingModal = () => {
    setShowUpcomingModal(false);
    setCurrentUpcomingAppointment(null);
  };

  const handleJoinFromUpcomingModal = () => {
    if (currentUpcomingAppointment) {
      joinMeeting(currentUpcomingAppointment.slotId);
      handleCloseUpcomingModal();
    }
  };

  const handleCardClick = (title) => {
    if (title === "Schedule an Appointment with a Specialist") {
      setIsMainModalOpen(true);
    }
  };

  const handleCallADoctorClick = async () => {
    setIsCallADoctorModalOpen(true);
  };

  const handleOpenPopover = (event, doctor, slotTime, slotId) => {
    setAnchorEl(event.currentTarget);
    setSelectedTime(slotTime);
    setSelectedDoctor(doctor);
    setSelectedSlotId(slotId);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setSelectedTime(null);
    setSelectedDoctor(null);
  };

  const handleCategoryClick = (categoryId) => {
    const category = specialistCategories.find((cat) => cat.id === categoryId);
    getSpecialistsDetails(category.name);
    setIsSpecialistsModalOpen(true);
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

      // Add the booked slot to our tracking set
      setBookedSlots((prev) => new Set(prev).add(slotId));

      handleClosePopover();
      setIsSpecialistsModalOpen(false);
      setIsMainModalOpen(false);
      getUpcomingAppointments();

      // Remove this part - don't filter out booked slots
      // setSpecialistDetails((prev) =>
      //   prev.map((doctor) => {
      //     if (doctor.doctorId === selectedDoctor.doctorId) {
      //       return {
      //         ...doctor,
      //         slots: doctor.slots.filter(
      //           (slot) => slot.slotId !== selectedSlotId
      //         ),
      //       };
      //     }
      //     return doctor;
      //   })
      // );
    } catch (error) {
      toast.error("Failed to book appointment");
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
      console.error("Error fetching specialist count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSpecialistsDetails = async (categoryName) => {
    setIsLoading(true);
    try {
      const transformedName = transformName(categoryName);
      const response = await axios.get(
        `${GETSPECIALISTDATA}?specialization=${transformedName}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const parsedResponse = response?.data || {};
      const specialists = Object.values(parsedResponse).flat();

      setSpecialistDetails(specialists);
      console.log(specialists);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching specialists:", error);
      setIsLoading(false);
    }
    console.log("Specialist details fetched:", specialistDetails);
  };

  const getUpcomingAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${GETUPCOMINGAPPOINTMENTS}/${patientId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const formattedData = response.data;
      setUpcomingAppointments(formattedData);
      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching upcoming appointments:", error);
      setIsLoading(false);
    }
  };

  const createMeeting = async () => {
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

      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();

    upcomingAppointments.forEach((appointment) => {
      if (!appointment.date || !appointment.time) return;

      const appointmentDateTime = new Date(
        `${appointment.date}T${appointment.time}`
      );
      if (isNaN(appointmentDateTime.getTime())) return;

      const timeDiffToStart = appointmentDateTime.getTime() - now.getTime();
      const minutesDiffToStart = Math.floor(timeDiffToStart / (1000 * 60));

      // Generate URL 5 minutes before appointment
      if (
        minutesDiffToStart === 5 &&
        !meetingUrlGenerated.has(appointment.slotId) &&
        !notificationShown.has(appointment.slotId)
      ) {
        generateMeetingUrl(appointment.slotId);
        setCurrentUpcomingAppointment(appointment);
        setShowUpcomingModal(true);
        toast.info(`Meeting URL generated for Dr. ${appointment.name}!`);
        setNotificationShown((prev) => new Set(prev).add(appointment.slotId));
      }

      // Show join option when appointment time arrives
      const minutesPastStart = Math.floor(
        (now.getTime() - appointmentDateTime.getTime()) / (1000 * 60)
      );
      const isActive = minutesPastStart >= 0 && minutesPastStart <= 1;

      if (isActive && meetingUrlGenerated.has(appointment.slotId)) {
        setShowModal(true);
      }
    });
  }, [
    currentTime,
    upcomingAppointments,
    meetingUrlGenerated,
    notificationShown,
    showModal
  ]);

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
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initialize booked slots from upcoming appointments for today
    const bookedSlotIds = upcomingAppointments
      .filter((apt) => dayjs(apt.date).isSame(dayjs(), "day"))
      .map((apt) => apt.slotId);

    setBookedSlots(new Set(bookedSlotIds));
  }, [upcomingAppointments]);

  // 5. Additional function to check if slot is booked from upcoming appointments
  const isSlotBookedFromAppointments = (slotId) => {
    return upcomingAppointments.some(
      (apt) => apt.slotId === slotId && dayjs(apt.date).isSame(dayjs(), "day")
    );
  };

  return (
    <div className="w-full">
      <ToastContainer />
      <div className="w-full px-4 py-8 overflow-hidden">
        <div className="w-full grid grid-cols-1 gap-x-8 md:grid-cols-2 lg:grid-cols-3 md:gap-8 mt-4">
          <div onClick={handleCallADoctorClick}>
            <Cards title="Call a Doctor" img={call} />
          </div>
          <div
            onClick={() =>
              handleCardClick("Schedule an Appointment with a Specialist")
            }
          >
            <Cards
              title="Schedule an Appointment with a Specialist"
              img={calendarIcon}
            />
          </div>
          <div onClick={() => handleCardClick("Get your test done")}>
            <Cards title="Get your test done" img={testTube} />
          </div>
        </div>

        <div className="w-full mt-6 py-4 bg-gray-100 flex flex-col gap-y-6 lg:gap-y-0 lg:flex-row items-start gap-x-8 px-1">
          <div className="w-full lg:w-[68%] rounded-lg border bg-white border-gray-200 p-4">
            <Calendar
              localizer={localizer}
              startAccessor="start"
              endAccessor="end"
              style={{
                height: 400,
                color: "gray",
                fontSize: 18,
                textAlign: "center",
              }}
            />
          </div>

          <div className="w-full lg:w-[32%] h-[435px] rounded-lg border overflow-y-scroll bg-white border-gray-200 p-4">
            <h2 className="text-lg font-bold text-blue-900 md:text-xl">
              Appointments
            </h2>
            <p className="text-gray-950/60 text-sm">
              View your upcoming appointments
            </p>
            {isLoading
  ? Array(3)
      .fill(0)
      .map((_, idx) => (
        <div
          className="mt-4 p-3 border rounded-lg animate-pulse hover:shadow-lg transition-shadow"
          key={`loading-appointment-${idx}`}
        >
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-2/5"></div>
        </div>
      ))
  : (() => {
      if (upcomingAppointments.length > 0) {
        return upcomingAppointments.map((details) => {
          const status = getAppointmentStatus(details);
          return (
            <div
              key={
                details.slotId ||
                details.id ||
                `${details.name}-${details.date}-${details.time}`
              }
              className={`flex items-center justify-between mt-4 p-2 border-2 rounded-lg transition-all duration-200 ${
                status === "over"
                  ? "bg-red-100 border-red-300 opacity-60 cursor-not-allowed pointer-events-none"
                  : `${getStatusColor(status)} hover:shadow-lg`
              }`}
            >
              <div className="flex items-center gap-2">
                <Avatar src={details?.imageUrl} sx={avatarStyle2} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-blue-900">
                    Dr. {details.name}
                  </p>
                  {status !== "upcoming" && (
                    <div className="text-xs font-semibold text-gray-600 mt-1">
                      {getStatusText(status)}
                    </div>
                  )}
                </div>
              </div>

              {/* Show Join Button if ACTIVE, otherwise show date/time */}
              {status === "active" ? (
                <button
                  onClick={() => handleJoinCall(details.slotId)}
                  disabled={isLoading}
                  className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-1 text-xs rounded transition-colors"
                >
                  Join Now
                </button>
              ) : (
                <div className="flex flex-col text-right">
                  <span className="text-xs text-gray-600">
                    📅 {details.date}
                  </span>
                  <span className="text-xs text-gray-600">
                    ⏰ {formatTime(details.time)}
                  </span>
                </div>
              )}
            </div>
          );
        });
      } else {
        return (
          <div className="text-center text-gray-600 text-sm p-4">
            No upcoming appointments
          </div>
        );
      }
    })()}
          </div>
        </div>
      </div>
    
      <Modal
        open={isMainModalOpen}
        onClose={() => setIsMainModalOpen(false)}
        aria-labelledby="category-modal-title"
      >
        <Box sx={modalStyle}>
          <div className="w-full flex justify-between items-center mb-4 bg-gradient-to-r from-blue-500 to-blue-700 p-4 rounded-t-lg">
            <p className="text-2xl text-white font-semibold">
              Choose Specialist
            </p>
            <button
              onClick={() => setIsMainModalOpen(false)}
              className="p-2 hover:bg-blue-600 rounded-full transition-colors"
            >
              <span className="text-white">✕</span>
            </button>
          </div>
          {specialistCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="w-full p-4 mb-4 hover:bg-blue-50 rounded-xl transition-colors border border-gray-100 hover:border-blue-100 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {category.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {category.count} specialists available
                    </div>
                  </div>
                </div>
                <span className="text-gray-400 group-hover:text-blue-500 transition-colors">
                  →
                </span>
              </div>
            </button>
          ))}
        </Box>
      </Modal>

      <Modal
        open={isSpecialistsModalOpen}
        onClose={() => setIsSpecialistsModalOpen(false)}
        aria-labelledby="specialists-modal-title"
      >
        <Box sx={{ height: 800, overflowY: "auto", ...modalStyle }}>
          <div className="w-full flex justify-between items-center mb-4">
            <p className="mb-1 text-2xl text-gray-950/60 font-semibold">
              Available Specialists
            </p>
            <button
              onClick={() => setIsSpecialistsModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <span className="text-gray-500">✕</span>
            </button>
          </div>

          <List sx={{ width: "100%", bgcolor: "background.paper" }}>
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton>
                      <div className="flex items-center justify-between w-full">
                        <div className="w-[10%]">
                          <Skeleton circle={true} height={50} width={50} />
                        </div>
                        <div className="w-[50%]">
                          <Skeleton height={20} width="80%" />
                          <Skeleton
                            height={14}
                            width="60%"
                            style={{ marginTop: 6 }}
                          />
                        </div>
                        <div className="w-[40%]">
                          <Skeleton height={20} width="100%" />
                        </div>
                      </div>
                    </ListItemButton>
                  </ListItem>
                ))
            ) : specialistDetails?.length > 0 ? (
              specialistDetails.map((specialist) => (
                <ListItem key={specialist.slots.slotId} disablePadding>
                  <ListItemButton>
                    <div className="px-4 py-4 border shadow-xl rounded-lg flex flex-col gap-4 w-full md:flex-row md:items-center">
                      <div className="flex flex-col items-center md:items-start md:w-1/3">
                        {specialist.doctorProfile ? (
                          <Avatar
                            src={specialist?.doctorProfile?.imageUrl}
                            sx={avatarStyle}
                            className="mb-4 md:mb-0"
                          />
                        ) : (
                          <Avatar
                            src="/broken-image.jpg"
                            sx={avatarStyle}
                            className="mb-4 md:mb-0"
                          />
                        )}
                      </div>

                      <div className="flex flex-col gap-2 md:w-2/3">
                        <p className="text-xl font-sans font-semibold text-gray-900 text-center md:text-left">
                          {specialist?.doctorProfile?.title +
                            " " +
                            specialist?.doctorProfile?.firstName +
                            " " +
                            specialist?.doctorProfile?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 text-center md:text-left">
                          {specialist?.doctorProfile?.practiceName +
                            " | " +
                            specialist?.doctorProfile?.qualifications}
                        </p>
                        <div className="flex flex-col items-center md:items-start">
                          <div className="flex flex-row items-center gap-1">
                            <PiStethoscope
                              style={{
                                width: "1.3em",
                                height: "1.3em",
                                color: "gray",
                              }}
                            />
                            <p className="text-sm text-gray-500">
                              {formatSpecialization(
                                specialist?.doctorProfile?.medicalSpecialization
                              )}
                            </p>
                          </div>
                          <button className="bg-blue-500 text-white text-sm py-1 px-4 rounded-sm hover:bg-blue-600 transition mt-2">
                            Available Today
                          </button>
                        </div>
                      </div>

                      <div className="w-[120px] mt-4 md:mt-0">
                        <p className="text-sm font-bold text-center md:text-left">
                          {dayjs().format("ddd, MMM D")}
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                          {specialist.slots?.length > 0 ? (
                            specialist.slots
                              .filter((slot) =>
                                dayjs(slot.date).isSame(dayjs(), "day")
                              )
                              .map((slot) => {
                                // Check both session bookings and upcoming appointments
                                const isBooked =
                                  bookedSlots.has(slot.slotId) ||
                                  isSlotBookedFromAppointments(slot.slotId);
                                return (
                                  <div
                                    key={slot.slotId}
                                    className="flex flex-col items-center"
                                  >
                                    <button
                                      className={`text-xs w-full flex flex-col gap-1 px-4 py-2 rounded-full transition ${
                                        isBooked
                                          ? "bg-red-400 text-white cursor-not-allowed opacity-70"
                                          : "bg-[#020E7C] text-white hover:bg-blue-600"
                                      }`}
                                      onClick={(e) =>
                                        !isBooked &&
                                        handleOpenPopover(
                                          e,
                                          specialist,
                                          `${slot.date}T${slot.time}`,
                                          slot.slotId
                                        )
                                      }
                                      disabled={isBooked}
                                    >
                                      {dayjs(
                                        `${slot.date}T${slot.time}`
                                      ).format("h:mm A")}
                                      {isBooked && (
                                      <span className="text-xs text-red-200 font-medium">
                                        Booked
                                      </span>
                                    )}
                                    </button>
                                  </div>
                                );
                              })
                          ) : (
                            <p className="text-sm text-gray-500">
                              No available slots today
                            </p>
                          )}{" "}
                        </div>
                      </div>
                    </div>
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <div className="w-full h-[300px] flex justify-center items-center">
                <p className="text-2xl text-gray-950/60">
                  No specialists available
                </p>
              </div>
            )}
          </List>
        </Box>
      </Modal>

      <Modal
        open={isCallADoctorModalOpen}
        onClose={() => setIsCallADoctorModalOpen(false)}
        aria-labelledby="specialists-modal-title"
      >
        <Box
          sx={{
            width: 400,
            height: 200,
            overflowY: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="w-full h-full flex flex-col gap-y-8 px-4">
            {videoLink === null ? (
              <>
                <p className="text-lg text-center font-medium">
                  Want to call a doctor?
                </p>
                <button
                  className="bg-blue-500 flex justify-center items-center w-full h-14 text-white rounded-full"
                  onClick={createMeeting}
                >
                  {isLoading ? (
                    <ColorRing
                      height="40"
                      width="40"
                      ariaLabel="color-ring-loading"
                      wrapperStyle={{}}
                      wrapperClass="color-ring-wrapper"
                      colors={["white", "white", "white", "white", "white"]}
                    />
                  ) : (
                    "Create Meeting"
                  )}
                </button>
              </>
            ) : (
              <div className="w-full h-full flex flex-col gap-y-4">
                <p className="text-xl font-medium">Your meeting link is:</p>
                <a
                  href={videoLink?.roomUrl}
                  className="text-[12px] cursor-pointer font-medium text-blue-800"
                >
                  {videoLink?.roomUrl}
                </a>
                {/* {showModal && videoMeetingUrl && ( */}
                  <Link
                    to={`/video-call?roomUrl=${encodeURIComponent(
                      videoLink?.roomUrl
                    )}`}
                  >
                    <button className="bg-blue-500 w-full h-10 text-white rounded-full">
                      Click to Join the Meeting
                    </button>
                  </Link>
                {/* )} */}
              </div>
            )}
          </div>
        </Box>
      </Modal>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <div className="p-4">
          <p>
            Confirm booking with{" "}
            <span className="font-bold">
              {selectedDoctor?.doctorProfile.title +
                " " +
                selectedDoctor?.doctorProfile.firstName +
                " " +
                selectedDoctor?.doctorProfile.lastName}
            </span>
          </p>
          <p className="font-bold">
            {selectedTime &&
              dayjs(selectedTime).format("MMMM D, YYYY [at] h:mm A")}
          </p>
          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant="outlined"
              size="small"
              onClick={handleClosePopover}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={(e) =>
                handleBookAppointment(e, selectedSlotId, patientId)
              }
              disabled={isBooking}
            >
              {isBooking ? (
                <ColorRing
                  height="20"
                  width="20"
                  ariaLabel="color-ring-loading"
                  wrapperStyle={{}}
                  wrapperClass="color-ring-wrapper"
                  colors={["white", "white", "white", "white", "white"]}
                />
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </div>
      </Popover>

      {showModal && videoMeetingUrl && (
        <Link to={`/video-call?roomUrl=${encodeURIComponent(videoMeetingUrl)}`}>
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="w-40 h-28 border rounded-lg py-4 px-4 grid place-items-center bg-green-700 bg-opacity-100 cursor-pointer hover:bg-green-800 transition-colors">
              <p className="text-white font-semibold text-center mb-2">
                Join Meeting Room
              </p>
              <LiaPhoneVolumeSolid
                className="shake text-yellow-500"
                fontSize={28}
              />
            </div>
          </div>
        </Link>
      )}

      {showUpcomingModal && currentUpcomingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <LiaPhoneVolumeSolid
                    className="text-blue-600"
                    fontSize={32}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upcoming Appointment
                </h3>
                <p className="text-gray-600 mb-4">
                  Your appointment with{" "}
                  <strong>Dr. {currentUpcomingAppointment.name}</strong> starts
                  in 5 minutes!
                </p>
                <div className="flex flex-col md:flex-row gap-4 items-center justify-center text-sm text-gray-500 mb-4">
                  <p className="text-xs">
                    📅 {currentUpcomingAppointment.date}
                  </p>
                  <p className="text-xs">
                    ⏰ {formatTime(currentUpcomingAppointment.time)}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={handleCloseUpcomingModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleJoinFromUpcomingModal}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Join Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
