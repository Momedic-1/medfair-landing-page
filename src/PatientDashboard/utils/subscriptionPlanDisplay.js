/** Keep in sync with backend {@code SubscriptionPlanCatalog}. */
export const GP_MONTHLY_CONSULTATIONS = 4;
export const GP_YEARLY_CONSULTATIONS = 36;

export const SPECIALIST_SINGLE_SESSION_TYPES = [
  "Urologist",
  "Mental Health Specialist",
  "Clinical Psychologist",
  "Relationship Therapist",
];

export const getPlanCategory = (planName) => {
  const name = String(planName || "").toLowerCase();
  if (
    name.includes("specialist") ||
    name.includes("ent") ||
    name.includes("ear nose throat")
  ) {
    return "Specialist";
  }
  return "GP";
};

export const getPlanSortOrder = (planName) => {
  const name = String(planName || "").toLowerCase();
  if (name.includes("yearly")) return 1;
  if (name.includes("monthly")) return 2;
  if (name.includes("instant - org") || name.includes("instant-org")) return 4;
  if (name.includes("instant")) return 3;
  if (name.includes("specialist") && name.includes("single")) return 5;
  if (name.includes("ent") || name.includes("ear nose throat")) return 6;
  return 99;
};

export const getDisplayConsultationCount = (planName, apiCount) => {
  const name = String(planName || "").toLowerCase();
  if (name.includes("monthly")) return GP_MONTHLY_CONSULTATIONS;
  if (name.includes("yearly")) return GP_YEARLY_CONSULTATIONS;
  return apiCount;
};

export const showIncludedLineUnderPrice = (planName) => {
  const name = String(planName || "").toLowerCase();
  return !name.includes("monthly") && !name.includes("yearly");
};

export const getPlanContent = (planName, consultationCount) => {
  const name = String(planName || "").toLowerCase();
  if (name.includes("instant")) {
    return [
      "GP consultations only — not for specialist visits",
      "One-time consultation for immediate advice",
      "Access to certified GPs",
      "Available 24/7",
    ];
  }
  if (name.includes("monthly")) {
    return [
      "GP consultations only — not for specialist visits",
      `Up to ${GP_MONTHLY_CONSULTATIONS} GP consultations per month`,
      "Ongoing health support",
      "Available 24/7",
    ];
  }
  if (name.includes("yearly")) {
    return [
      "GP consultations only — not for specialist visits",
      `Up to ${GP_YEARLY_CONSULTATIONS} GP consultations per year (~3 per month)`,
      "Expert care anytime",
      "Priority support",
    ];
  }
  if (name.includes("specialist") && name.includes("single")) {
    return [
      "Required to book a specialist appointment",
      `Covers: ${SPECIALIST_SINGLE_SESSION_TYPES.join(", ")}`,
      "One scheduled video consultation",
      "Fast and easy booking",
      "Confidential and secure sessions",
    ];
  }
  if (name.includes("ent") || name.includes("ear nose throat")) {
    return [
      "Required to book an ENT specialist appointment",
      "Covers: Ear, Nose & Throat (ENT) Specialist",
      "One scheduled video consultation",
      "Diagnosis and management of ENT conditions",
      "Follow-up reviews when needed",
    ];
  }
  return [
    `${consultationCount} consultation${consultationCount > 1 ? "s" : ""} included`,
    "Access to certified doctors",
    "Available 24/7",
  ];
};

export const formatSubscriptionPrice = (price) =>
  new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

export const mapPlanForDisplay = ({
  id,
  name,
  price,
  consultationCount: apiCount,
  adjustPrice = (planName, amount) => amount,
}) => {
  const consultationCount = getDisplayConsultationCount(name, apiCount);
  return {
    id,
    title: name,
    category: getPlanCategory(name),
    subTitle: adjustPrice(name, price),
    content: getPlanContent(name, consultationCount),
    buttonText: "Subscribe",
    buttonLink: "/payment",
    consultationCount,
    showIncludedLine: showIncludedLineUnderPrice(name),
  };
};

export const sortPlansForDisplay = (plans) =>
  [...plans].sort(
    (a, b) => getPlanSortOrder(a.title) - getPlanSortOrder(b.title)
  );
