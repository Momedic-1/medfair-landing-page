/** Normalize API / auth error payloads into a single string. */
function pickMessage(data) {
  if (data == null) return null;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof data === "object") {
    return (
      data.message ||
      data.error ||
      data.exceptionMessage ||
      data.detail ||
      (Array.isArray(data.errors) && data.errors[0]?.defaultMessage) ||
      (Array.isArray(data.errors) && data.errors[0]?.message) ||
      null
    );
  }
  return null;
}

/** Login and general API errors shown in the UI. */
export function formatAuthError(payload, fallback = "Sign-in failed. Check your email or phone and password.") {
  if (payload?.network) {
    return pickMessage(payload) || fallback;
  }
  const msg = pickMessage(payload);
  if (msg) {
    const lower = msg.toLowerCase();
    if (lower.includes("cannot reach the api")) {
      return msg;
    }
    if (lower.includes("bad credentials") || lower.includes("invalid credentials")) {
      return "Incorrect email/phone or password. Please try again.";
    }
    if (lower.includes("verify") && (lower.includes("email") || lower.includes("account"))) {
      return "Please verify your email before signing in.";
    }
    if (lower.includes("disabled") || lower.includes("locked")) {
      return "This account is disabled. Contact support for help.";
    }
    if (lower === "an error occurred" && payload?.exceptionMessage) {
      return payload.exceptionMessage;
    }
    return msg;
  }
  const status = payload?.status ?? (typeof payload === "number" ? payload : null);
  if (status === 401 || status === 403) {
    return "Incorrect email/phone or password. Please try again.";
  }
  return fallback;
}

/** Extract a user-visible message from axios / API errors. */
export function parseApiError(error, fallback = "Something went wrong. Please try again.") {
  const status = error?.response?.status;
  const data = error?.response?.data;
  const msg = pickMessage(data);

  if (msg) return msg;

  if (error?.message === "Network Error") {
    return "Network error. Check your internet connection and try again.";
  }

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status === 403) {
    return "You do not have permission to do that.";
  }

  if (status === 404) {
    return "We could not find what you requested. It may have been removed.";
  }

  if (status === 409) {
    if (msg) {
      const lower = msg.toLowerCase();
      if (
        lower.includes("already have a call waiting") ||
        lower.includes("cancel that call")
      ) {
        return "You already have a call waiting for a doctor. Cancel that one before starting a new call.";
      }
      if (
        lower.includes("already have an active call") ||
        lower.includes("end your current call")
      ) {
        return "You already have an active call. End or rejoin that one before starting a new call.";
      }
      if (lower.includes("no doctor has joined")) {
        return "No doctor has joined yet. Cancel the waiting call instead of ending the consultation.";
      }
      if (lower.includes("already assigned") || lower.includes("another doctor")) {
        return "Another doctor has already joined this call.";
      }
      return msg;
    }
    return "This action is no longer allowed. Refresh the page and try again.";
  }

  if (status >= 500) {
    return "Our servers are having trouble. Please try again in a few minutes.";
  }

  if (error?.message) return error.message;
  return fallback;
}

/** Appointment cancellation errors. */
export function parseCancelError(error) {
  const status = error?.response?.status;
  const msg = pickMessage(error?.response?.data);

  if (msg) {
    const lower = msg.toLowerCase();
    if (lower.includes("not allowed")) {
      return "You cannot cancel this appointment. Make sure you are signed in as the patient or doctor for this visit.";
    }
    if (lower.includes("already joined") || lower.includes("clinician has")) {
      return "This visit can no longer be cancelled because the clinician has already joined.";
    }
    if (lower.includes("within") && lower.includes("minutes")) {
      return "Appointments cannot be cancelled within 20 minutes of the start time.";
    }
    if (lower.includes("already cancelled")) {
      return "This appointment has already been cancelled.";
    }
    return msg;
  }

  if (status === 404) {
    return "Cancellation is not available right now. Please try again later or contact support.";
  }

  if (status === 403) {
    return "We could not cancel this appointment. Sign out, sign in again, and try once more.";
  }

  if (status === 409) {
    return "This appointment can no longer be cancelled (too close to start time or the clinician already joined).";
  }

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status >= 500) {
    return "We could not cancel right now. Please try again in a few minutes.";
  }

  return parseApiError(error, "We could not cancel this appointment. Please try again.");
}
