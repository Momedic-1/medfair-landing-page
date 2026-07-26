const TIP_CACHE = "medfair-health-tip-v1";
const TIP_STATE_URL = "/__medfair_health_tip_state__";

function localTodayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function readTipState() {
  try {
    const cache = await caches.open(TIP_CACHE);
    const res = await cache.match(TIP_STATE_URL);
    if (!res) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function writeTipState(state) {
  const cache = await caches.open(TIP_CACHE);
  await cache.put(TIP_STATE_URL, new Response(JSON.stringify(state)));
}

async function maybeShowScheduledHealthTip() {
  const state = await readTipState();
  if (!state?.title || !state?.body) return;

  const now = new Date();
  const todayKey = localTodayKey(now);
  if (state.shownDateKey === todayKey) return;

  const hour = typeof state.hour === "number" ? state.hour : 7;
  const minute = typeof state.minute === "number" ? state.minute : 0;
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (now.getTime() < target.getTime()) return;

  await self.registration.showNotification(state.title, {
    body: state.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: `daily-health-tip-${todayKey}`,
    data: { url: "/patient-dashboard", type: "DAILY_HEALTH_TIP" },
  });

  await writeTipState({ ...state, shownDateKey: todayKey });
}

self.addEventListener("message", (event) => {
  const data = event.data;
  if (data?.type === "SCHEDULE_DAILY_HEALTH_TIP" && data.payload) {
    event.waitUntil(
      writeTipState(data.payload).then(() => maybeShowScheduledHealthTip()),
    );
  }
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "daily-health-tip") {
    event.waitUntil(maybeShowScheduledHealthTip());
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(maybeShowScheduledHealthTip());
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = payload.title || "MedFair";
  const isHealthTip = payload.type === "DAILY_HEALTH_TIP";
  const options = {
    body: payload.body || "You have a new update.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: {
      url: payload.url || (isHealthTip ? "/patient-dashboard" : "/doctor-dashboard"),
      callId: payload.callId || null,
      type: payload.type || null,
    },
    tag: payload.tag || undefined,
  };

  if (!isHealthTip) {
    options.actions = [
      { action: "answer", title: "Answer" },
      { action: "view", title: "View queue" },
    ];
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const type = event.notification?.data?.type;
  const defaultUrl =
    type === "DAILY_HEALTH_TIP" ? "/patient-dashboard" : "/doctor-dashboard";
  const url = event.notification?.data?.url || defaultUrl;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
      return undefined;
    }),
  );
});
