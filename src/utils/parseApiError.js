/** Extract a user-visible message from axios / API errors. */
export function parseApiError(error, fallback = "Something went wrong. Please try again.") {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (data?.error) return String(data.error);
  if (data?.exceptionMessage) return String(data.exceptionMessage);
  if (data?.message) return String(data.message);
  if (error?.message === "Network Error") {
    return "Network error — check your connection and try again.";
  }
  if (error?.message) return error.message;
  return fallback;
}
