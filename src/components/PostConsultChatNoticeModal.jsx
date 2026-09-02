import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Shown after a consultation ends so patients discover the free 24h chat.
 */
export default function PostConsultChatNoticeModal({ isOpen, onClose, doctorName }) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const who = doctorName?.trim() || "your doctor";

  const goToChats = () => {
    onClose?.();
    navigate("/patient-dashboard/consultation-history");
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#020e7c]/10 text-[#020e7c]">
          <MessageCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-[#020e7c]">You can chat with {who}</h2>
        <p className="mt-2 text-sm text-gray-600">
          Free follow-up chat is open for <strong>24 hours</strong> after this consultation.
          Open <strong>Consultations</strong>, then tap <strong>Open chat</strong> to message
          your doctor — they will get an email and a push notification when you send a message.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Later
          </button>
          <button
            type="button"
            onClick={goToChats}
            className="rounded-xl bg-[#020e7c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#010a5c]"
          >
            Open Consultations
          </button>
        </div>
      </div>
    </div>
  );
}
