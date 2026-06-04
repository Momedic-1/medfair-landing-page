/** PWA install helpers (iOS has no beforeinstallprompt). */

export function isIOSDevice() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isIOSSafari() {
  if (!isIOSDevice()) return false;
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua);
}

export function isStandalonePwa() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export function getInstallPath() {
  if (typeof window === "undefined") return "/get-app";
  return `${window.location.origin}/get-app`;
}

/** Full URL to share for PWA install (same as /get-app). */
export function getInstallShareUrl() {
  return getInstallPath();
}

export async function copyInstallLink() {
  const url = getInstallShareUrl();
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return url;
  }
  if (typeof document === "undefined") {
    throw new Error("Clipboard not available");
  }
  const input = document.createElement("textarea");
  input.value = url;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(input);
  if (!ok) throw new Error("Could not copy link");
  return url;
}
