import { normalizeDateOfBirth } from "./normalizeDateOfBirth";
import {
  readPatientPageCache,
  writePatientPageCache,
} from "./patientPageCache";

export function patientProfileCacheKey(userId) {
  return `patient-profile:${userId}`;
}

/** Map GET /api/patient-profile/{id} payload into profile form state. */
export function mapPatientProfileApi(data, prev = {}) {
  if (!data || typeof data !== "object") return null;

  const profile = data.profile || data.patientProfile || {};
  const address = data.address || {};
  const emergencyContact = data.emergencyContact || {};
  const medicalHistory = Array.isArray(data.medicalHistory)
    ? data.medicalHistory
    : [];
  const docUrls = Array.isArray(data.documents) ? data.documents : [];
  const docCategories = Array.isArray(data.documentCategories)
    ? data.documentCategories
    : [];

  const documents = docUrls.map((url, i) => ({
    fileUrl: typeof url === "string" ? url : url?.fileUrl || url?.url,
    url: typeof url === "string" ? url : url?.fileUrl || url?.url,
    category: docCategories[i] || "",
    documentCategory: docCategories[i] || "",
    fileName:
      (typeof url === "object" && (url?.fileName || url?.name)) ||
      `Document ${i + 1}`,
    name:
      (typeof url === "object" && (url?.fileName || url?.name)) ||
      `Document ${i + 1}`,
  }));

  return {
    fullName: profile.fullName ?? prev.fullName ?? "",
    email: profile.email ?? prev.email ?? "",
    dateOfBirth:
      normalizeDateOfBirth(profile.dateOfBirth) ||
      normalizeDateOfBirth(prev.dateOfBirth) ||
      "",
    age: profile.age ?? prev.age ?? 0,
    weight: profile.weight ?? prev.weight ?? "",
    bloodGroup: profile.bloodGroup ?? prev.bloodGroup ?? "",
    genotype: profile.genotype ?? prev.genotype ?? "",
    imageUrl: profile.imageUrl ?? prev.imageUrl ?? "",
    emergencyContact: {
      name: emergencyContact.fullName ?? prev.emergencyContact?.name ?? "",
      relationship:
        emergencyContact.relationship ??
        prev.emergencyContact?.relationship ??
        "",
      phoneNumber:
        emergencyContact.phoneNumber ??
        prev.emergencyContact?.phoneNumber ??
        "",
      email: emergencyContact.email ?? prev.emergencyContact?.email ?? "",
    },
    address: {
      street:
        address.streetAddress ??
        address.street ??
        prev.address?.street ??
        "",
      city: address.city ?? prev.address?.city ?? "",
      state: address.state ?? prev.address?.state ?? "",
      country: address.country ?? prev.address?.country ?? "",
      postalCode:
        address.zipCode ??
        address.postalCode ??
        prev.address?.postalCode ??
        "",
    },
    medicalHistory,
    documents,
    documentCategories: docCategories,
    documentCategory: prev.documentCategory ?? "",
  };
}

export function readCachedPatientProfile(userId) {
  if (!userId) return null;
  return readPatientPageCache(patientProfileCacheKey(userId));
}

export function writeCachedPatientProfile(userId, profileState) {
  if (!userId || !profileState) return;
  writePatientPageCache(patientProfileCacheKey(userId), profileState);
}
