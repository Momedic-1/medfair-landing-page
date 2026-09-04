import axios from "axios";
import { baseUrl } from "../env";
import { clearPatientGpCall } from "./patientGpCall";
import {
  clearDoctorRejoinSession,
  clearPatientGpVideoContext,
} from "./activeCallSession";

function pickErrorText(error) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (data?.message) return String(data.message);
  if (data?.error) return String(data.error);
  if (error?.message) return String(error.message);
  return "";
}

export function parseEndConsultationError(error) {
  const status = error?.response?.status;
  const raw = pickErrorText(error);
  const lower = raw.toLowerCase();

  if (
    status === 409 ||
    lower.includes("no doctor has joined") ||
    lower.includes("patient can cancel")
  ) {
    return (
      raw ||
      "No doctor has joined yet. If you are the patient, cancel the call instead of ending the consultation."
    );
  }

  if (lower.includes("cannot end") && lower.includes("doctor has joined")) {
    return "You cannot end the call after the doctor has joined. Wait for the doctor to end the consultation.";
  }

  return raw || "Could not end the consultation. Please try again.";
}

/** Clear all GP rejoin / active-meeting persistence (both roles). */
export function clearAllGpCallPersistence() {
  try {
    localStorage.removeItem("activeMeeting");
  } catch {
    // ignore
  }
  try {
    localStorage.removeItem("patientId");
  } catch {
    // ignore
  }
  clearDoctorRejoinSession();
  clearPatientGpVideoContext();
  clearPatientGpCall();
}

/**
 * Doctor formally ends an in-progress GP consultation.
 * Patient Leave must NOT call this.
 */
export async function endGpConsultationByDoctor({ callId, token }) {
  if (callId == null || !token) {
    throw new Error("Missing call or sign-in details.");
  }

  const response = await axios.post(
    `${baseUrl}/api/v1/video/end-call-by-doctor/${callId}`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  clearAllGpCallPersistence();
  return response.data;
}

/**
 * Fetch GP call status.
 * Returns null on network/auth errors.
 * Maps 404 / not-found to { status: "ENDED" } so stale Rejoin can clear.
 */
export async function fetchGpCallStatus(callId, token) {
  if (callId == null || !token) return null;
  try {
    const response = await axios.get(
      `${baseUrl}/api/v1/video/${callId}/status`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const message = String(
      error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "",
    ).toLowerCase();
    if (
      status === 404 ||
      message.includes("call not found") ||
      message.includes("not found")
    ) {
      return { status: "ENDED", callId, message: "Call not found" };
    }
    return null;
  }
}
