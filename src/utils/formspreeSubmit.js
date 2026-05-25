/**
 * Submit a form to Formspree (JSON accept header for AJAX responses).
 */
export async function submitToFormspree(endpoint, fields) {
  const body = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value != null && value !== "") {
      body.append(key, String(value));
    }
  });

  const response = await fetch(endpoint, {
    method: "POST",
    body,
    headers: { Accept: "application/json" },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data.error === "string"
        ? data.error
        : data.errors?.map((e) => e.message).join(", ") ||
          "Failed to send. Please try again.";
    throw new Error(message);
  }

  return data;
}
