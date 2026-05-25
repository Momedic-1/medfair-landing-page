import axios from "axios";
import { baseUrl } from "../env";
import { transformName } from "../utils";
import { slotWithDate } from "./slotDateTime";
import dayjs from "dayjs";

export function normalizeProfileResponse(apiRes) {
  const raw = apiRes?.data?.data ?? apiRes?.data ?? apiRes;
  return raw;
}

export function sortSpecialistSlotGroups(specialist) {
  if (!specialist?.slotGroups) return specialist;
  return {
    ...specialist,
    slotGroups: [...specialist.slotGroups]
      .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
      .map((group) => ({
        ...group,
        slots: (group.slots || [])
          .map((s) => slotWithDate(s, group.date))
          .sort((a, b) => {
            const ta = dayjs(`${a.date}T${a.time}`);
            const tb = dayjs(`${b.date}T${b.time}`);
            return ta.valueOf() - tb.valueOf();
          }),
      })),
  };
}

export async function fetchDoctorProfileForPatient(doctorId, token) {
  const response = await axios.get(
    `${baseUrl}/api/v1/doctor-profile/profile-full/${doctorId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return normalizeProfileResponse(response);
}

export async function fetchDoctorSlotsForPatient({
  doctorId,
  specialization,
  token,
}) {
  const specKey = transformName(
    specialization?.replace(/_/g, " ") ||
      formatSpecializationEnum(specialization)
  );
  const response = await axios.get(
    `${baseUrl}/api/appointments/specialists/slots?specialization=${encodeURIComponent(specKey)}&_=${Date.now()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  const flat = Object.values(response?.data || {}).flat();
  const match = flat.find((d) => Number(d.doctorId) === Number(doctorId));
  return match ? sortSpecialistSlotGroups(match) : null;
}

function formatSpecializationEnum(spec) {
  if (!spec) return "";
  return String(spec).toUpperCase();
}
