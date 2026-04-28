"use client";

import { useEffect } from "react";
import { dispatchDueNotifications, registerNotificationWorker, setNotificationPermissionState, syncReminderSchedule } from "@/lib/notifications/reminders";

export function NotificationsBootstrap() {
  useEffect(() => {
    let timer: number | undefined;
    void (async () => {
      await registerNotificationWorker();
      if (typeof window !== "undefined" && "Notification" in window) {
        await setNotificationPermissionState(Notification.permission, false);
      }
      await syncReminderSchedule();
      await dispatchDueNotifications();
      timer = window.setInterval(() => {
        void dispatchDueNotifications();
      }, 60_000);
    })();
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, []);

  return null;
}
