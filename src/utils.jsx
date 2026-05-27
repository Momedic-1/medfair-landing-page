export const capitalizeFirstLetter = (name) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};
export const formatDate = (date )=> {
  const formattedDate = new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return formattedDate
}
export const formatAppointmentDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const transformName = (categoryName) => {
  // Create a mapping from display names to backend enum values
  const specializationMapping = {
    "Mental Health Specialist": "MENTAL_HEALTH_SPECIALIST",
    "Clinical Psychologist": "CLINICAL_PSYCHOLOGIST", 
    "Relationship Therapist": "RELATIONSHIP_THERAPIST",
    "Ear, Nose, and Throat Specialist": "EAR_NOSE_THROAT_SPECIALIST",
    "Urologist": "UROLOGIST"
  };
  
  // Return the mapped enum value, or fallback to the original transformation
  return specializationMapping[categoryName] || categoryName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
};
// export const transformName = (name) => {
//   return name?.toUpperCase().replace(/\s+/g, '_');
// };

export const formatSpecialization = (text) => {
  return text
    ?.toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
export const formatAppointments = (data) => {
  const formattedAppointments = {};

  data.forEach((item) => {
    const { date, time, name } = item;

    // Format time (e.g., 16:30 -> 4:30 PM)
    const formattedTime = new Date(
      0, 0, 0, time.hour, time.minute, time.second
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // 12-hour format
    });

    formattedAppointments[date] = {
      time: formattedTime,
      description: `Appointment with ${name}`,
    };
  });

  return formattedAppointments;
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};

export const getToken = ()=> {
  try {
    const raw = localStorage.getItem('authToken');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

export const formatTime = (time) => {
  const [hours, minutes, seconds] = time.split(':');
  const date = new Date();
  date.setHours(hours, minutes, seconds);

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const getUserData = () => {
  try {
    return JSON.parse(localStorage.getItem('userData'));
  } catch {
    return null;
  }
}

export const getId = () =>{
  try {
    return JSON.parse(localStorage.getItem('userData'))?.id
  } catch {
    return null;
  }
}

/** localStorage key — set at partner signup and on login when API returns partnerSlug */
export const PATIENT_PARTNER_SLUG_STORAGE_KEY = "patientPartnerSlug";

export function setPatientPartnerSlug(slug) {
  if (slug == null || String(slug).trim() === "") return;
  try {
    localStorage.setItem(PATIENT_PARTNER_SLUG_STORAGE_KEY, String(slug).trim());
  } catch {
    /* ignore */
  }
}

/**
 * Partner slug for the logged-in patient (e.g. first-care-hospital).
 * Prefer dedicated storage, then common fields on userData from login.
 */
export function getPatientPartnerSlug() {
  try {
    const stored = localStorage.getItem(PATIENT_PARTNER_SLUG_STORAGE_KEY);
    if (stored != null && String(stored).trim() !== "") {
      return String(stored).trim();
    }

    const user = getUserData();
    if (!user || typeof user !== "object") return null;

    const candidates = [
      user.partnerSlug,
      user.partner_slug,
      user.partnerOrganizationSlug,
      user.organizationPartnerSlug,
      user.partner?.slug,
      user.organization?.partnerSlug,
      user.organization?.slug,
    ];
    for (const c of candidates) {
      if (c != null && String(c).trim() !== "") return String(c).trim();
    }
  } catch {
    return null;
  }
  return null;
}