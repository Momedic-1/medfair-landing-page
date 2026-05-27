import axios from "axios";
import { baseUrl } from "../env";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function getPushPublicKey(token) {
  const response = await axios.get(`${baseUrl}/api/doctor/push/public-key`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response?.data?.publicKey;
}

export async function ensureDoctorPushSubscription(token) {
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }
  if (!token) return false;

  const permission = Notification.permission === "default"
    ? await Notification.requestPermission()
    : Notification.permission;
  if (permission !== "granted") return false;

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  if (existing) return true;

  const publicKey = await getPushPublicKey(token);
  if (!publicKey) return false;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const json = subscription.toJSON();
  await axios.post(
    `${baseUrl}/api/doctor/push/subscribe`,
    {
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return true;
}

export async function showIncomingCallNotification({ title, body, url = "/incoming-call", callId = null }) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url, callId, type: "INCOMING_CALL" },
      actions: [
        { action: "answer", title: "Answer" },
        { action: "view", title: "View queue" },
      ],
    });
    return;
  }

  // Fallback (non-PWA contexts)
  new Notification(title, { body, icon: "/icons/icon-192.png" });
}

