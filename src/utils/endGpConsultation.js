import axios from "axios";
import { baseUrl } from "../env";
import { clearPatientGpCall } from "./patientGpCall";
import {
  clearDoctorRejoinSession,
  clearPatientGpVideoContext,
} from "./activeCallSession";

export function parseEndConsultationError(error) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (data?.message) return data.message;
  if (data?.error) return data.error;
  return "Could not end the consultation. Please try again.";
}

/** Clear all GP rejoin / active-meeting persistence (both roles). */
export function clearAllGpCallPersistence() {
  try {
    localStorage.removeItem("activeMeeting");
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

/** Fetch GP call status; returns null on network/auth errors. */
export async function fetchGpCallStatus(callId, token) {
  if (callId == null || !token) return null;
  try {
    const response = await axios.get(
      `${baseUrl}/api/v1/video/${callId}/status`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch {
    return null;
  }
}
