self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("sync", (event) => {
  if (event.tag !== "serey-padma-reminders") return;
  event.waitUntil(
    self.registration.showNotification("Serey Padma by Céline", {
      body: "Rappels verifies en arriere-plan. Ouvre l'app pour voir les details.",
      tag: "sync-serey-padma-reminders",
      icon: "/serey_padma_lotus.png",
      badge: "/icon-192.svg",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/logistique"));
});
