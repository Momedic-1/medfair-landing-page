import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { formatAppointmentDate, formatTime, getToken } from "../../utils";
import { baseUrl } from "../../env";
import { LiaPhoneVolumeSolid } from "react-icons/lia";

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

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Check for upcoming appointments (5 minutes before)
  useEffect(() => {
    const checkUpcomingAppointments = () => {
      const now = new Date();

      appointments.forEach((appointment) => {
        if (!appointment.date || !appointment.time) return;

        // Parse appointment date and time
        const appointmentDateTime = new Date(
          `${appointment.date}T${appointment.time}`
        );
        const timeDiff = appointmentDateTime.getTime() - now.getTime();
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));

        // Show modal 5 minutes before appointment
        if (
          minutesDiff === 5 &&
          !upcomingAppointments.has(appointment.slotId)
        ) {
          setUpcomingAppointments((prev) =>
            new Set(prev).add(appointment.slotId)
          );
          setCurrentUpcomingAppointment(appointment);
          setShowUpcomingModal(true);
          toast.info(
            `Appointment with ${appointment.name} starting in 5 minutes!`
          );
        }
      });
    };

    checkUpcomingAppointments();
  }, [currentTime, appointments, upcomingAppointments]);

  const getAppointmentStatus = (appointment) => {
    if (!appointment.date || !appointment.time) return "unknown";

    const now = new Date();
    const appointmentDateTime = new Date(
      `${appointment.date}T${appointment.time}`
    );
    const timeDiff = now.getTime() - appointmentDateTime.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (minutesDiff > 15) {
      return "over"; // More than 15 minutes past appointment time
    } else if (minutesDiff >= -5 && minutesDiff <= 15) {
      return "active"; // 5 minutes before to 15 minutes after
    } else {
      return "upcoming"; // More than 5 minutes before
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
    <div className="w-full h-[420px] bg-white rounded-[12px] md:text-[14px] shadow-lg">
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
              <div
                key={appointment.id || appointment.slotId || index}
                className={`flex items-center justify-between px-4 rounded-lg mt-4 p-2 border-2 ${getStatusColor(
                  status
                )}`}
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
                  onClick={() => handleJoinCall(appointment.slotId)}
                  disabled={status === "over" || isLoading}
                  className={`px-3 py-1 rounded text-xs transition-colors duration-200 ${
                    status === "over"
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : status === "active"
                      ? "bg-green-600 hover:bg-green-700 text-white animate-pulse"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {status === "over" ? "Time Over" : "Join Call"}
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
      {showModal && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="w-40 h-24 border rounded-lg py-4 px-4 grid place-items-center bg-green-700 bg-opacity-100 cursor-pointer">
            <p className="text-white font-semibold text-center mb-2">
              Incoming Call
            </p>
            <LiaPhoneVolumeSolid
              className="shake text-yellow-500"
              fontSize={28}
            />
          </div>
        </div>
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
                  <p>
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
