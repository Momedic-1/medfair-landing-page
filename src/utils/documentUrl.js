/** Make Cloudinary / stored document URLs openable in a browser tab. */
export function toViewableDocumentUrl(doc) {
  let url = String(doc?.url || doc?.fileUrl || "").trim();
  if (!url) return null;
  url = url.replace(/^http:\/\//i, "https://");

  const name = String(doc?.fileName || "").toLowerCase();
  const type = String(doc?.fileType || "").toLowerCase();
  const isPdf = type.includes("pdf") || name.endsWith(".pdf");
  const isDoc =
    type.includes("word") ||
    type.includes("msword") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx");

  // PDFs / Office files uploaded under image/* often 404 in browser; prefer raw delivery.
  if ((isPdf || isDoc) && url.includes("/image/upload/")) {
    url = url.replace("/image/upload/", "/raw/upload/");
  }

  return url;
}
