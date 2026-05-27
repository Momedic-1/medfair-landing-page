import { useState } from "react";
import { toast } from "react-toastify";
import { FORMSPREE_CONSULTATION_FEEDBACK_URL } from "../constants/formspree";
import { submitToFormspree } from "../utils/formspreeSubmit";

const ConsultationFeedbackModal = ({
  isOpen,
  onClose,
  userData = {},
  callId = null,
}) => {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const patientName = [userData?.firstName, userData?.lastName]
    .filter(Boolean)
    .join(" ");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitToFormspree(FORMSPREE_CONSULTATION_FEEDBACK_URL, {
        _subject: "Post-consultation feedback",
        name: patientName || "Patient",
        email: userData?.emailAddress || userData?.email || "",
        rating: String(rating),
        message: feedback,
        callId: callId != null ? String(callId) : "",
        role: "PATIENT",
      });
      toast.success("Thank you for your feedback!");
      onClose();
    } catch (err) {
      toast.error(err.message || "Could not send feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-[#020e7c] mb-1">
          How was your consultation?
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Your feedback helps us improve care. You can skip if you prefer.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <div className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`text-2xl leading-none transition ${
                    n <= rating ? "text-yellow-500" : "text-gray-300"
                  }`}
                  aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
                >
                  ★
                </button>
              ))}
              <span className="ml-2 text-xs font-medium text-gray-500">
                {rating} / 5
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comments (optional)
            </label>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Submit feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsultationFeedbackModal;
