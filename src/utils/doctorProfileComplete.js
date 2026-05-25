/** Fields doctors must complete (matches ViewProfile required inputs). */
const REQUIRED_PROFILE_FIELDS = [
  { key: "title", label: "Title" },
  { key: "imageUrl", label: "Profile photo" },
  { key: "languages", label: "Languages" },
  { key: "practiceName", label: "Practice name" },
  { key: "licenseLocation", label: "License location" },
  { key: "qualifications", label: "Qualifications" },
  { key: "about", label: "About" },
];

const isFilled = (value) => {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/** Normalize profile-full API payload to a flat data object. */
export function getDoctorProfileData(apiResponse) {
  if (!apiResponse) return null;
  return apiResponse.data ?? apiResponse;
}

export function getMissingFieldsFromData(data) {
  if (!data) return REQUIRED_PROFILE_FIELDS.map((f) => f.label);

  return REQUIRED_PROFILE_FIELDS.filter(
    ({ key }) => !isFilled(data[key]),
  ).map((f) => f.label);
}

export function getMissingProfileFields(apiResponse) {
  return getMissingFieldsFromData(getDoctorProfileData(apiResponse));
}

export function isDoctorProfileComplete(apiResponse) {
  return getMissingProfileFields(apiResponse).length === 0;
}
