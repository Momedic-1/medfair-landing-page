import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ColorRing } from "react-loader-spinner";
import { Link } from "react-router-dom";
import { formatAppointmentDate, formatTime, getToken } from "../../utils";
import { baseUrl } from "../../env";

function AppointmentRequests({ appointments }) {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userId = userData.id;

  const [showModal, setShowModal] = useState(false);
  const [videoLink, setVideoLink] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
          appointments.map((appointment, index) => (
            <div
              key={appointment.id || appointment.slotId || index}
              className="flex items-center justify-between px-4 bg-gray-100 rounded-lg mt-4 p-2"
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
              </div>

              <div className="text-[#020e7c] text-[12px] md:text-[14px] font-normal font-['Roboto'] leading-[25px]">
                📅{" "}
                {appointment.date
                  ? formatAppointmentDate(appointment.date)
                  : "No date"}
              </div>

              <div className="text-[#020e7c] px-2 text-[12px] md:text-[14px] font-normal font-['Roboto'] leading-[25px]">
                ⏰ {appointment.time ? formatTime(appointment.time) : "No time"}
              </div>

              <button
                onClick={() => handleJoinCall(appointment.slotId)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors duration-200 disabled:bg-gray-400"
              >
                Join Call
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-blue-900 text-sm mt-8">
            No appointment requests yet.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-auto">
            <div className="w-full h-full flex flex-col gap-y-8 px-4">
              {videoLink === null ? (
                <>
                  <p className="text-lg text-center font-medium">
                    Want to call a doctor?
                  </p>
                  <button
                    className="bg-blue-500 flex justify-center items-center w-full h-14 text-white rounded-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ColorRing
                        height="40"
                        width="40"
                        ariaLabel="color-ring-loading"
                        colors={["white", "white", "white", "white", "white"]}
                      />
                    ) : (
                      "Create Meeting"
                    )}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-y-4">
                  <p className="text-xl font-medium">Your meeting link is:</p>
                  <a
                    href={videoLink}
                    className="text-sm font-medium text-blue-800 underline break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {videoLink}
                  </a>
                  <Link
                    to={`/video-call?roomUrl=${encodeURIComponent(videoLink)}`}
                  >
                    <button className="bg-blue-500 w-full h-10 text-white rounded-full">
                      Click to join the call
                    </button>
                  </Link>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-sm text-red-500 mt-2"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentRequests;
