import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { formatAppointmentDate, formatTime, getToken } from "../../utils";
import { baseUrl } from "../../env";
import { LiaPhoneVolumeSolid } from "react-icons/lia";
import { Link } from "react-router-dom";

function AppointmentRequests({ appointments }) {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userId = userData.id;

  const [showModal, setShowModal] = useState(false);
  const [videoLink, setVideoLink] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [upcomingAppointments, setUpcomingAppointments] = useState(new Set());
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);
  const [currentUpcomingAppointment, setCurrentUpcomingAppointment] =
    useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const now = new Date();

    appointments.forEach((appointment) => {
      if (!appointment.date || !appointment.time) return;

      const appointmentDateTime = new Date(
        `${appointment.date}T${appointment.time}`
      );

      // Check if the date is valid
      if (isNaN(appointmentDateTime.getTime())) {
        console.warn(
          "Invalid appointment date/time:",
          appointment.date,
          appointment.time
        );
        return;
      }

      const timeDiff = appointmentDateTime.getTime() - now.getTime();
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));

      // Show reminder between 4-6 minutes before (more flexible range)
      if (
        minutesDiff >= 4 &&
        minutesDiff <= 6 &&
        !upcomingAppointments.has(appointment.slotId)
      ) {
        setUpcomingAppointments((prev) =>
          new Set(prev).add(appointment.slotId)
        );
        setCurrentUpcomingAppointment(appointment);
        setShowUpcomingModal(true);
        toast.info(
          `Appointment with ${appointment.name} starting in ${minutesDiff} minutes!`
        );
      }

      // Auto open Join Call modal when appointment is due (0 to 1 min after)
      const nowDiff = now.getTime() - appointmentDateTime.getTime();
      const nowMinutesDiff = Math.floor(nowDiff / (1000 * 60));
      const isNow = nowMinutesDiff >= 0 && nowMinutesDiff <= 1;

      // Close reminder modal if it's time for the meeting
      if (
        isNow &&
        showUpcomingModal &&
        currentUpcomingAppointment?.slotId === appointment.slotId
      ) {
        setShowUpcomingModal(false);
        setCurrentUpcomingAppointment(null);
      }

      if (isNow && !showModal && !videoLink) {
        handleJoinCall(appointment.slotId);
      }
    });
  }, [currentTime, appointments, upcomingAppointments]);

  // Also update the timer to check more frequently
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // Check every 30 seconds instead of 60

    return () => clearInterval(timer);
  }, []);

  const getAppointmentStatus = (appointment) => {
    if (!appointment.date || !appointment.time) return "unknown";

    const now = new Date();
    const appointmentDateTime = new Date(
      `${appointment.date}T${appointment.time}`
    );
    const timeDiff = now.getTime() - appointmentDateTime.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (minutesDiff > 30) {
      return "over";
    } else if (minutesDiff >= -5 && minutesDiff <= 30) {
      return "active";
    } else {
      return "upcoming";
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
      const url = `${baseUrl}/api/appointment/meetings/${slotId}/users/${userId}/join`;

      const response = await axios.post(
        url,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Joined call successfully!");
      setVideoLink(response.data.meetingUrl);
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

  const handleCloseUpcomingModal = () => {
    setShowUpcomingModal(false);
    setCurrentUpcomingAppointment(null);
  };

  const handleJoinFromUpcomingModal = () => {
    if (currentUpcomingAppointment) {
      handleJoinCall(currentUpcomingAppointment.slotId);
      handleCloseUpcomingModal();
    }
  };

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
        return "⏰ Appointment Time Over";
      case "active":
        return "🟢 Active";
      case "upcoming":
        return "⏳ Upcoming";
      default:
        return "";
    }
  };

  return (
    <div className="w-full h-[420px] bg-white rounded-[12px] md:text-[14px] overflow-y-scroll shadow-lg">
      <div className="px-4 py-4">
        <div className="flex justify-between text-[#020e7c]">
          <span className="text-base font-semibold font-['Roboto'] leading-[25px]">
            Appointment Requests
          </span>
          <span className="text-xs font-bold font-['Roboto'] leading-[25px] cursor-pointer">
            View all
          </span>
        </div>

        {appointments.length > 0 ? (
          appointments.map((appointment, index) => {
            const status = getAppointmentStatus(appointment);

            return (
              <div key={appointment.id || appointment.slotId || index}
                onClick={() =>
                  status !== "over" &&
                  !isLoading
                }
                className={`flex items-center justify-between px-4 rounded-lg mt-4 p-2 border-2 transition-all duration-200 ${
                  status === "over"
                    ? "bg-red-100 border-red-300 cursor-not-allowed opacity-60 pointer-events-none"
                    : `${getStatusColor(status)} cursor-pointer hover:shadow-md`
                }`}
              >
                <div className="flex-shrink-0">
                  {appointment.imageUrl ? (
                    <img
                      src={appointment.imageUrl}
                      alt={`${appointment.name}'s avatar`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-xs">
                      {appointment.name
                        ?.split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase() || "?"}
                    </div>
                  )}
                </div>

                <div className="flex-1 ml-2">
                  <div className="text-[#020e7c] text-[12px] md:text-[14px] font-normal font-['Roboto'] leading-[25px]">
                    {appointment.name || "Unknown"}
                  </div>
                  {status !== "upcoming" && (
                    <div className="text-xs font-semibold text-gray-600">
                      {getStatusText(status)}
                    </div>
                  )}
                </div>

                <div className="text-[#020e7c] text-[12px] md:text-[14px] font-normal font-['Roboto'] leading-[25px]">
                  📅{" "}
                  {appointment.date
                    ? formatAppointmentDate(appointment.date)
                    : "No date"}
                </div>

                <div className="text-[#020e7c] px-2 text-[12px] md:text-[14px] font-normal font-['Roboto'] leading-[25px]">
                  ⏰{" "}
                  {appointment.time ? formatTime(appointment.time) : "No time"}
                </div>
                <button
                onClick={()=> handleJoinCall(appointment.slotId) }
                >
                  joi
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center text-blue-900 text-sm mt-8">
            No appointment requests yet.
          </div>
        )}
      </div>

      {/* Video Call Modal */}
      {showModal && videoLink && (
        <Link to={`/video-call?roomUrl=${encodeURIComponent(videoLink)}`}>
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

      {/* Upcoming Appointment Modal */}
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
                  <strong>{currentUpcomingAppointment.name}</strong> starts in 5
                  minutes!
                </p>
                <div className="text-sm text-gray-500 mb-4">
                  <p className="pb-2">
                    📅 {formatAppointmentDate(currentUpcomingAppointment.date)}
                  </p>
                  <p>⏰ {formatTime(currentUpcomingAppointment.time)}</p>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Joining..." : "Join Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentRequests;
