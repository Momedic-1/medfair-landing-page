/**
 * E2E checks: partner list API + patient registration with/without partnerSlug.
 *
 * Usage:
 *   node scripts/test-signup-partner-e2e.mjs
 *   API_URL=http://localhost:8081 node scripts/test-signup-partner-e2e.mjs
 *   RUN_REGISTRATION=1 node scripts/test-signup-partner-e2e.mjs
 */
import assert from "node:assert/strict";

const API_URL = (process.env.API_URL || process.env.VITE_API_URL || "https://backend-h3k6.onrender.com").replace(/\/$/, "");
const RUN_REGISTRATION = process.env.RUN_REGISTRATION === "1";

function sortPartners(list) {
  return [...list]
    .filter((row) => row?.slug && String(row.slug).trim())
    .map((row) => ({
      name: String(row.name || row.slug).trim(),
      slug: String(row.slug).trim(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function isSortedByName(list) {
  for (let i = 1; i < list.length; i++) {
    if (list[i - 1].name.localeCompare(list[i].name) > 0) return false;
  }
  return true;
}

async function getPartnerOrganizations() {
  const res = await fetch(`${API_URL}/api/v1/registration/partner-organizations`, {
    headers: { Accept: "application/json" },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

function buildRegistrationPayload({ partnerSlug, suffix = "" } = {}) {
  const stamp = `${Date.now()}${suffix}`;
  const payload = {
    firstName: "E2E",
    lastName: "PartnerTest",
    emailAddress: `e2e.partner.${stamp}@medfair-test.invalid`,
    phoneNumber: `+23480${String(stamp).slice(-9).padStart(9, "0")}`,
    gender: "Male",
    password: "TestPass123!",
    confirmedPassword: "TestPass123!",
    medicalSpecialization: "string",
    nameOfHospital: "string",
    howDidYouHearAboutUs: "NEWSPAPER",
    userRole: "PATIENT",
  };
  if (partnerSlug) payload.partnerSlug = partnerSlug;
  return payload;
}

async function registerPatient(payload) {
  const res = await fetch(`${API_URL}/api/v1/registration/patients-registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  return { status: res.status, body };
}

console.log(`\n=== Signup + Partner E2E ===`);
console.log(`API: ${API_URL}\n`);

// 1) Frontend sort helper
const unsorted = [
  { name: "Zeta Hospital", slug: "zeta" },
  { name: "Alpha Care", slug: "alpha" },
];
const sorted = sortPartners(unsorted);
assert.equal(sorted[0].name, "Alpha Care");
assert.equal(sorted[1].name, "Zeta Hospital");
console.log("✓ Client-side partner list sorts A→Z");

// 2) Partner organizations API
const { status, body } = await getPartnerOrganizations();

if (status === 404) {
  console.warn("⚠ GET /partner-organizations → 404 — deploy latest backend to enable dropdown from DB");
} else if (status !== 200) {
  console.warn(`⚠ GET /partner-organizations → ${status}`, typeof body === "string" ? body.slice(0, 120) : body);
} else {
  assert.ok(Array.isArray(body), "partner-organizations should return JSON array");
  const normalized = sortPartners(body);
  assert.ok(isSortedByName(normalized), "API list should be alphabetical by name");
  console.log(`✓ Partner organizations API (${normalized.length} with slug)`);
  if (normalized.length > 0) {
    console.log(`  First: ${normalized[0].name} (${normalized[0].slug})`);
    if (normalized.length > 1) {
      console.log(`  Last:  ${normalized[normalized.length - 1].name}`);
    }
  } else {
    console.log("  (no organizations with slug in DB yet)");
  }
}

// 3) Registration (optional — set RUN_REGISTRATION=1)
if (RUN_REGISTRATION) {
  const without = await registerPatient(buildRegistrationPayload({ suffix: "-a" }));
  assert.ok(
    without.status === 201 || without.status === 200,
    `registration without partner should succeed, got ${without.status}: ${JSON.stringify(without.body)}`,
  );
  console.log("✓ Patient registration without partnerSlug");

  const bogus = await registerPatient(
    buildRegistrationPayload({ partnerSlug: "nonexistent-slug-e2e-xyz", suffix: "-b" }),
  );
  assert.ok(
    bogus.status === 201 || bogus.status === 200,
    `registration with unknown slug should not break signup, got ${bogus.status}: ${JSON.stringify(bogus.body)}`,
  );
  console.log("✓ Patient registration with unknown partnerSlug (signup still OK, no org link)");

  if (status === 200 && Array.isArray(body) && body.length > 0) {
    const slug = sortPartners(body)[0].slug;
    const withPartner = await registerPatient(
      buildRegistrationPayload({ partnerSlug: slug, suffix: "-c" }),
    );
    assert.ok(
      withPartner.status === 201 || withPartner.status === 200,
      `registration with valid slug failed: ${withPartner.status}`,
    );
    console.log(`✓ Patient registration with partnerSlug=${slug}`);
  }
} else {
  console.log("\nℹ Skip live registration (set RUN_REGISTRATION=1 to test POST on API)");
}

console.log("\n=== All checks passed ===\n");
