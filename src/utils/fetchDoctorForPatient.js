import axios from "axios";
import { baseUrl } from "../env";
import { transformName } from "../utils";
import { slotWithDate } from "./slotDateTime";
import {
  normalizeSpecialistSlotGroups,
  normalizeSlotDate,
} from "./normalizeSpecialistSlots";
import dayjs from "dayjs";

export function normalizeProfileResponse(apiRes) {
  const raw = apiRes?.data?.data ?? apiRes?.data ?? apiRes;
  return raw;
}

export function sortSpecialistSlotGroups(specialist) {
  const normalized = normalizeSpecialistSlotGroups(specialist);
  if (!normalized?.slotGroups?.length) return normalized;
  return {
    ...normalized,
    slotGroups: [...normalized.slotGroups]
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

/** Pull slot rows out of any common API shape (array, { slots }, or date-keyed map). */
export function extractSlotsFromApiPayload(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;

  if (Array.isArray(raw.slots)) return raw.slots;
  if (Array.isArray(raw.content)) return raw.content;
  if (Array.isArray(raw.data)) return raw.data;

  if (typeof raw === "object") {
    const rows = [];
    for (const [key, value] of Object.entries(raw)) {
      if (!Array.isArray(value)) continue;
      const dateFromKey = /^\d{4}-\d{2}-\d{2}/.test(key)
        ? key.slice(0, 10)
        : null;
      value.forEach((slot) => {
        rows.push({
          ...slot,
          date:
            slot?.date ||
            slot?.slotDate ||
            slot?.appointmentDate ||
            dateFromKey,
        });
      });
    }
    if (rows.length) return rows;
  }

  return [];
}

/** Merge slot data from list row + availability + specialists endpoints. */
export function mergeSpecialistSlots(base, ...extraSources) {
  const slotMap = new Map();

  const ingest = (source) => {
    if (!source) return;
    const normalized = normalizeSpecialistSlotGroups(source);
    for (const group of normalized.slotGroups || []) {
      for (const slot of group.slots || []) {
        const id = slot.slotId ?? slot.id;
        const key =
          id != null
            ? String(id)
            : `${slot.date}-${slot.time}-${Math.random()}`;
        slotMap.set(key, slot);
      }
    }
    for (const slot of extractSlotsFromApiPayload(source)) {
      const date =
        normalizeSlotDate(slot?.date) ||
        normalizeSlotDate(slot?.slotDate) ||
        normalizeSlotDate(slot?.appointmentDate);
      if (!date) continue;
      const id = slot.slotId ?? slot.id;
      const key = id != null ? String(id) : `${date}-${slot.time}`;
      slotMap.set(key, slotWithDate(slot, date));
    }
  };

  ingest(base);
  extraSources.forEach(ingest);

  return sortSpecialistSlotGroups({
    ...base,
    doctorId: base?.doctorId ?? base?.id,
    slots: Array.from(slotMap.values()),
  });
}

export async function fetchDoctorProfileForPatient(doctorId, token) {
  const response = await axios.get(
    `${baseUrl}/api/v1/doctor-profile/profile-full/${doctorId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return normalizeProfileResponse(response);
}

/** Flatten specialists/slots API payload (object map, array, or nested). */
export function flattenSpecialistsFromApi(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.specialists)) return data.specialists;
  if (Array.isArray(data.content)) return data.content;
  const values = Object.values(data);
  if (values.length && values.every((v) => Array.isArray(v))) {
    return values.flat();
  }
  if (values.some((v) => v && (v.doctorId != null || v.id != null))) {
    return values;
  }
  return [];
}

/** Open slots for one doctor — `/api/appointments/available/{doctorId}`. */
export async function fetchDoctorAvailableSlots(doctorId, token) {
  if (!doctorId || !token) return null;
  try {
    const response = await axios.get(
      `${baseUrl}/api/appointments/available/${doctorId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const slots = extractSlotsFromApiPayload(response?.data);
    if (!slots.length) return null;
    return sortSpecialistSlotGroups({
      doctorId: Number(doctorId),
      slots,
    });
  } catch {
    return null;
  }
}

/** Specialist row from category listing (no availability call). */
export async function fetchSpecialistRowFromCategory({
  doctorId,
  specialization,
  token,
}) {
  const specKey = transformName(
    specialization?.replace(/_/g, " ") ||
      formatSpecializationEnum(specialization)
  );
  try {
    const response = await axios.get(
      `${baseUrl}/api/appointments/specialists/slots?specialization=${encodeURIComponent(specKey)}&_=${Date.now()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const flat = flattenSpecialistsFromApi(response?.data);
    const match = flat.find(
      (d) => Number(d.doctorId ?? d.id) === Number(doctorId)
    );
    return match ? sortSpecialistSlotGroups(match) : null;
  } catch {
    return null;
  }
}

export async function fetchDoctorSlotsForPatient({
  doctorId,
  specialization,
  token,
}) {
  const [available, listed] = await Promise.all([
    fetchDoctorAvailableSlots(doctorId, token),
    fetchSpecialistRowFromCategory({ doctorId, specialization, token }),
  ]);
  return mergeSpecialistSlots(
    { doctorId: Number(doctorId) },
    available,
    listed
  );
}

/** Load every slot source for booking cards. */
export async function enrichSpecialistWithSlots(spec, categorySpec, token) {
  const doctorId = spec?.doctorId ?? spec?.id;
  const base = normalizeSpecialistSlotGroups(spec);

  if (!doctorId || !token) return base;

  const specKey =
    base?.doctorProfile?.medicalSpecialization || categorySpec;

  const [available, listed] = await Promise.all([
    fetchDoctorAvailableSlots(doctorId, token),
    fetchSpecialistRowFromCategory({
      doctorId,
      specialization: specKey,
      token,
    }),
  ]);

  const merged = mergeSpecialistSlots(base, available, listed);

  return {
    ...merged,
    doctorProfile: base.doctorProfile || listed?.doctorProfile || available?.doctorProfile,
    doctorId: Number(doctorId),
  };
}

function formatSpecializationEnum(spec) {
  if (!spec) return "";
  return String(spec).toUpperCase();
}
