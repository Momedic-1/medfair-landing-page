import { Modal, Box } from "@mui/material";
import { ColorRing } from "react-loader-spinner";
import { CalendarDays, PhoneOff, Video, CreditCard } from "lucide-react";
import { callDoctorModalSx } from "./bookingModalStyles";

export default function CallDoctorModal({
  open,
  callStatus,
  videoLink,
  isLoading,
  doctorName,
  onClose,
  onCreateMeeting,
  onCancelWaiting,
  onBookAppointment,
  onTryAgain,
  onJoinCall,
  onBuySubscription,
  onRefreshWaitingStatus,
}) {
  const handleBackdropClose = () => {
    if (callStatus === "WAITING") {
      onCancelWaiting?.();
      return;
    }
    if (callStatus === "DOCTOR_JOINED") {
      // Keep ready-to-join state; user can reopen from the dashboard banner.
      onClose?.();
      return;
    }
    onClose?.();
  };

  const title =
    callStatus === "WAITING"
      ? "Connecting you…"
      : callStatus === "DOCTOR_JOINED"
        ? "Doctor is ready"
        : callStatus === "NO_DOCTOR"
          ? "No doctor available"
          : callStatus === "NEEDS_SUBSCRIPTION"
            ? "Instant plan required"
            : "Call a doctor";

  return (
    <Modal open={open} onClose={handleBackdropClose} aria-labelledby="call-doctor-modal">
      <Box sx={callDoctorModalSx}>
        <div className="border-b border-gray-100 bg-gradient-to-r from-[#020e7c] to-blue-700 px-4 py-4 sm:px-5">
          <h2
            id="call-doctor-modal"
            className="text-lg font-semibold text-white sm:text-xl"
          >
            {title}
          </h2>
        </div>

        <div className="flex flex-col gap-5 px-4 py-6 sm:px-6 sm:py-7">
          {callStatus === "WAITING" && (
            <>
              <div className="flex flex-col items-center gap-3 text-center">
                <ColorRing
                  height="56"
                  width="56"
                  ariaLabel="waiting-for-doctor"
                  colors={["#3b82f6", "#3b82f6", "#3b82f6", "#3b82f6", "#3b82f6"]}
                />
                <p className="text-base font-medium text-gray-900 sm:text-lg">
                  Looking for a doctor…
                </p>
                <p className="rounded-xl bg-blue-50 px-3 py-3 text-sm leading-relaxed text-blue-900">
                  Keep this screen open. As soon as a doctor accepts, you will
                  see <span className="font-semibold">Join call</span> — they
                  may already be waiting in the video room. You can cancel only
                  while no doctor has joined yet.
                </p>
              </div>
              <button
                type="button"
                className="flex h-12 w-full items-center justify-center rounded-full bg-[#020e7c] font-semibold text-white transition hover:bg-blue-800 disabled:opacity-70"
                onClick={onRefreshWaitingStatus}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ColorRing
                    height="36"
                    width="36"
                    ariaLabel="checking-status"
                    colors={["white", "white", "white", "white", "white"]}
                  />
                ) : (
                  "Check if doctor joined"
                )}
              </button>
              <button
                type="button"
                className="flex h-12 w-full items-center justify-center rounded-full bg-red-500 font-medium text-white transition hover:bg-red-600"
                onClick={onCancelWaiting}
              >
                Cancel call
              </button>
            </>
          )}

          {callStatus === "DOCTOR_JOINED" && (
            <>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  {isLoading ? (
                    <ColorRing
                      height="40"
                      width="40"
                      ariaLabel="joining-call"
                      colors={["#059669", "#059669", "#059669", "#059669", "#059669"]}
                    />
                  ) : (
                    <Video className="h-7 w-7" aria-hidden />
                  )}
                </div>
                <p className="text-base font-medium text-gray-900 sm:text-lg">
                  {isLoading
                    ? "Connecting you to the consultation…"
                    : doctorName
                      ? `${doctorName} has accepted your call`
                      : "A doctor has accepted your call"}
                </p>
                <p className="rounded-xl bg-blue-50 px-3 py-3 text-sm leading-relaxed text-blue-900">
                  {isLoading
                    ? "The doctor may already be waiting in the video room. Please keep this screen open — do not cancel or close while we connect you."
                    : "The doctor may already be in the video room. Tap Join call below and keep this screen open while we connect you."}
                </p>
                {!isLoading && (
                  <p className="text-sm leading-relaxed text-gray-600">
                    If the call does not open, allow pop-ups or use the Rejoin
                    banner on your dashboard.
                  </p>
                )}
              </div>
              <button
                type="button"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70"
                onClick={onJoinCall}
                disabled={isLoading || !videoLink?.roomUrl}
              >
                {isLoading ? (
                  <>
                    <ColorRing
                      height="36"
                      width="36"
                      ariaLabel="joining-call"
                      colors={["white", "white", "white", "white", "white"]}
                    />
                    Connecting…
                  </>
                ) : (
                  <>
                    <Video className="h-5 w-5" aria-hidden />
                    Join call
                  </>
                )}
              </button>
              {!isLoading && (
                <button
                  type="button"
                  className="flex h-11 w-full items-center justify-center rounded-full border border-gray-200 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  onClick={onClose}
                >
                  Join later from dashboard
                </button>
              )}
            </>
          )}

          {callStatus === "NO_DOCTOR" && (
            <>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <PhoneOff className="h-7 w-7" aria-hidden />
                </div>
                <p className="text-base font-medium text-gray-900 sm:text-lg">
                  No doctor joined your call
                </p>
                <p className="text-sm leading-relaxed text-gray-600">
                  All doctors may be busy right now. Book an appointment with a
                  specialist and choose a time that works for you.
                </p>
              </div>
              <button
                type="button"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#020e7c] font-semibold text-white transition hover:bg-blue-800"
                onClick={onBookAppointment}
              >
                <CalendarDays className="h-5 w-5" aria-hidden />
                Book an appointment
              </button>
              <button
                type="button"
                className="flex h-11 w-full items-center justify-center rounded-full border border-gray-200 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                onClick={onTryAgain}
              >
                Try calling again
              </button>
            </>
          )}

          {callStatus === "NEEDS_SUBSCRIPTION" && (
            <>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#020e7c]/10 text-[#020e7c]">
                  <CreditCard className="h-7 w-7" aria-hidden />
                </div>
                <p className="text-base font-medium text-gray-900 sm:text-lg">
                  You need Instant or a subscription
                </p>
                <p className="text-sm leading-relaxed text-gray-600">
                  Buy Instant or subscribe to start a GP video call. Once your
                  plan is active, come back here and tap Start call.
                </p>
              </div>
              <button
                type="button"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#020e7c] font-semibold text-white transition hover:bg-blue-800"
                onClick={onBuySubscription}
              >
                <CreditCard className="h-5 w-5" aria-hidden />
                Buy Instant / subscribe
              </button>
              <button
                type="button"
                className="flex h-11 w-full items-center justify-center rounded-full border border-gray-200 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                onClick={onClose}
              >
                Close
              </button>
            </>
          )}

          {!callStatus && videoLink === null && (
            <>
              <p className="text-center text-base font-medium text-gray-800">
                Speak with a general practitioner now?
              </p>
              <p className="text-center text-sm text-gray-500">
                We will connect you as soon as a doctor is free.
              </p>
              <button
                type="button"
                className="flex h-14 w-full items-center justify-center rounded-full bg-[#020e7c] font-semibold text-white transition hover:bg-blue-800 disabled:opacity-70"
                onClick={onCreateMeeting}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ColorRing
                    height="36"
                    width="36"
                    ariaLabel="creating-meeting"
                    colors={["white", "white", "white", "white", "white"]}
                  />
                ) : (
                  "Start call"
                )}
              </button>
            </>
          )}
        </div>
      </Box>
    </Modal>
  );
}
