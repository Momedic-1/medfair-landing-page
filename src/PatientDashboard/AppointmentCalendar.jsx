import { useState, useEffect } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Avatar } from "@mui/material";
import { formatTime } from "../utils";
import { LiaPhoneVolumeSolid } from "react-icons/lia";

const localizer = dayjsLocalizer(dayjs);

const avatarStyle2 = {
  width: 40,
  height: 40,
};

const AppointmentCalendar = ({ 
  upcomingAppointments, 
  isLoading, 
  onJoinCall,
  currentTime 
}) => {
  const [upcomingAppointmentIds, setUpcomingAppointmentIds] = useState(new Set());
  const [showUpcomingModal, setShowUpcomingModal] = useState(false);
  const [currentUpcomingAppointment, setCurrentUpcomingAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Get appointment status based on current time
  const getAppointmentStatus = (appointment) => {
    if (!appointment.date || !appointment.time) return "unknown";

    const now = new Date();
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const timeDiff = now.getTime() - appointmentDateTime.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));

    if (minutesDiff > 30) {
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
        return "⏰ Appointment Time Over";
      case "active":
        return "🟢 Active";
      case "upcoming":
        return "⏳ Upcoming";
      default:
        return "";
    }
  };

  // Check for upcoming appointments (5-minute reminder)
  useEffect(() => {
    const checkUpcomingAppointments = () => {
      const now = new Date();

      upcomingAppointments.forEach((appointment) => {
        if (!appointment.date || !appointment.time) return;

        const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);

        // Check if the date is valid
        if (isNaN(appointmentDateTime.getTime())) {
          console.warn("Invalid appointment date/time:", appointment.date, appointment.time);
          return;
        }

        const timeDiff = appointmentDateTime.getTime() - now.getTime();
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));

        // Show reminder between 4-6 minutes before (more flexible range)
        if (
          minutesDiff >= 4 &&
          minutesDiff <= 6 &&
          !upcomingAppointmentIds.has(appointment.slotId)
        ) {
          setUpcomingAppointmentIds((prev) => new Set(prev).add(appointment.slotId));
          setCurrentUpcomingAppointment(appointment);
          setShowUpcomingModal(true);
        }

        // Auto-close reminder modal when appointment is due (0 to 1 min after)
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
          setShowModal(true);
        }
      });
    };

    checkUpcomingAppointments();
  }, [currentTime, upcomingAppointments, upcomingAppointmentIds, showUpcomingModal, currentUpcomingAppointment]);

  // Handle upcoming modal actions
  const handleCloseUpcomingModal = () => {
    setShowUpcomingModal(false);
    setCurrentUpcomingAppointment(null);
  };

  const handleJoinFromUpcomingModal = () => {
    if (currentUpcomingAppointment) {
      onJoinCall(currentUpcomingAppointment.slotId);
      handleCloseUpcomingModal();
    }
  };

  return (
    <>
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
          <h2 className="text-lg font-bold text-blue-900 md:text-xl">Appointments</h2>
          <p className="text-gray-950/60 text-sm">View your upcoming appointments</p>
          
          {isLoading
            ? Array(3).fill(0).map((_, idx) => (
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
                        key={details.slotId || details.id || `${details.name}-${details.date}-${details.time}`}
                        className={`flex flex-row gap-4 mt-4 p-4 border-2 rounded-lg transition-all duration-200 ${
                          status === "over"
                            ? "bg-red-100 border-red-300 opacity-60"
                            : `${getStatusColor(status)} hover:shadow-lg`
                        }`}
                      >
                        <Avatar src={details?.imageUrl} sx={avatarStyle2} />
                        <div className="flex flex-col flex-1">
                          <p className="text-sm font-bold text-blue-900">
                            Dr. {details.name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>📅 {details.date}</span>
                            <span>⏰ {formatTime(details.time)}</span>
                          </div>
                          {status !== "upcoming" && (
                            <div className="text-xs font-semibold text-gray-600 mt-1">
                              {getStatusText(status)}
                            </div>
                          )}
                        </div>
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

      {/* Upcoming Appointment Reminder Modal */}
      {showUpcomingModal && currentUpcomingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <LiaPhoneVolumeSolid className="text-blue-600" fontSize={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Appointment</h3>
                <p className="text-gray-600 mb-4">
                  Your appointment with <strong>Dr. {currentUpcomingAppointment.name}</strong> starts in 5 minutes!
                </p>
                <div className="text-sm text-gray-500 mb-4">
                  <p className="pb-2">📅 {currentUpcomingAppointment.date}</p>
                  <p>⏰ {formatTime(currentUpcomingAppointment.time)}</p>
                </div>
              </div>

              <div className="flex space-x-3 justify-center">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                  onClick={handleCloseUpcomingModal}
                >
                  Dismiss
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  onClick={handleJoinFromUpcomingModal}
                >
                  Join Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Meeting Notification */}
      {showModal && (
        <div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          onClick={handleJoinFromUpcomingModal}
        >
          <div className="w-40 h-28 border rounded-lg py-4 px-4 grid place-items-center bg-green-700 bg-opacity-100 cursor-pointer">
            <p className="text-white font-semibold text-center mb-2">Join Meeting Room</p>
            <LiaPhoneVolumeSolid className="shake text-yellow-500" fontSize={28} />
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentCalendar;