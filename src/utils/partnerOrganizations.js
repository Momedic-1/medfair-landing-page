import { baseUrl } from "../env";

/**
 * Partner hospitals from DB (organization slug + display name).
 * @returns {Promise<Array<{ name: string, slug: string }>>}
 */
export async function fetchPartnerOrganizations() {
  const response = await fetch(
    `${baseUrl}/api/v1/registration/partner-organizations`,
    { headers: { Accept: "application/json" } },
  );

  if (!response.ok) {
    throw new Error("Could not load partner hospitals.");
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data
    .filter((row) => row?.slug && String(row.slug).trim())
    .map((row) => ({
      name: String(row.name || row.slug).trim(),
      slug: String(row.slug).trim(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function findPartnerBySlug(partners, slug) {
  if (!slug) return null;
  const norm = String(slug).trim().toLowerCase();
  return partners.find((p) => p.slug.toLowerCase() === norm) ?? null;
}
