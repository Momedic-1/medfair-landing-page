import { useEffect, useState } from "react";
import { notificationsGranted } from "../../utils/notificationPermission";
import NotificationPermissionPrompt from "../patient/NotificationPermissionPrompt";

const NOTIFICATION_PROMPT_SESSION = "medfair_notification_prompt_dismissed_session";

/** Prompts doctors (and other roles) to allow browser notifications. */
export default function AppNotificationPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (notificationsGranted()) return;
    if (sessionStorage.getItem(NOTIFICATION_PROMPT_SESSION) === "true") return;
    const timer = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    sessionStorage.setItem(NOTIFICATION_PROMPT_SESSION, "true");
    setOpen(false);
  };

  return (
    <NotificationPermissionPrompt
      open={open}
      onClose={close}
      onGranted={() => sessionStorage.setItem(NOTIFICATION_PROMPT_SESSION, "true")}
    />
  );
}
