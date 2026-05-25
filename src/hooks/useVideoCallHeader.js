import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { baseUrl } from "../env";
import { getToken } from "../utils";
import {
  buildVideoCallHeaderDisplay,
  getStoredPatientId,
  resolveVideoCallRole,
} from "../utils/videoCallDisplayInfo";

/** Header labels only — does not affect Whereby video join. */
export function useVideoCallHeader(userData, call) {
  const [patientProfile, setPatientProfile] = useState(null);
  const role = resolveVideoCallRole(userData);

  const patientId = useMemo(
    () => call?.patientId || getStoredPatientId(),
    [call],
  );

  const displayInfo = useMemo(
    () => buildVideoCallHeaderDisplay(role, call, userData, patientProfile),
    [role, call, userData, patientProfile],
  );

  useEffect(() => {
    if (role !== "DOCTOR" || !patientId) {
      setPatientProfile(null);
      return undefined;
    }

    const token = getToken();
    if (!token) return undefined;

    let cancelled = false;

    axios
      .get(`${baseUrl}/api/patient-profile/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (!cancelled) setPatientProfile(res?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setPatientProfile(null);
      });

    return () => {
      cancelled = true;
    };
  }, [role, patientId]);

  return displayInfo;
}
