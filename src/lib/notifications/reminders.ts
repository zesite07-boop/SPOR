import { db, type NotificationPrefs, type ReminderNotification } from "@/lib/db/schema";
import { listUpcomingRetreats } from "@/lib/reservation/catalog";

const PREFS_ID = "global";

function atHourMs(isoDate: string, hour = 9): number {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
}

function firstNameFromLabel(input: string): string {
  const n = input.trim();
  if (!n) return "Participante";
  return n.split(/\s+/)[0] ?? "Participante";
}

async function ensurePrefs(): Promise<NotificationPrefs | null> {
  if (!db) return null;
  const row = await db.notificationPrefs.get(PREFS_ID);
  if (row) return row;
  const created: NotificationPrefs = {
    id: PREFS_ID,
    enabled: true,
    askedOnboarding: false,
    permission: "default",
    updatedAt: Date.now(),
  };
  await db.notificationPrefs.put(created);
  return created;
}

export async function setNotificationPermissionState(permission: NotificationPrefs["permission"], askedOnboarding: boolean) {
  if (!db) return;
  const prev = await ensurePrefs();
  if (!prev) return;
  await db.notificationPrefs.put({
    ...prev,
    permission,
    askedOnboarding: prev.askedOnboarding || askedOnboarding,
    updatedAt: Date.now(),
  });
}

export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "default" as NotificationPermission;
  const permission = await Notification.requestPermission();
  await setNotificationPermissionState(permission, true);
  return permission;
}

export async function getNotificationPrefs() {
  return ensurePrefs();
}

export async function setNotificationsEnabled(enabled: boolean) {
  if (!db) return;
  const prev = await ensurePrefs();
  if (!prev) return;
  await db.notificationPrefs.put({ ...prev, enabled, updatedAt: Date.now() });
}

export async function registerNotificationWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  const reg = await navigator.serviceWorker.register("/notifications-sw.js", { scope: "/" });
  const syncManager = (reg as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }).sync;
  if (syncManager) {
    try {
      await syncManager.register("serey-padma-reminders");
    } catch {
      // noop
    }
  }
  return reg;
}

export async function syncReminderSchedule() {
  if (!db) return;
  const retreats = listUpcomingRetreats(new Date(new Date().getFullYear() - 1, 0, 1));
  const participants = await db.logisticsParticipants.toArray();
  const reservations = await db.reservations.toArray();

  const reminders: ReminderNotification[] = [];
  const now = Date.now();
  for (const retreat of retreats) {
    reminders.push({
      id: `j7-${retreat.id}`,
      type: "retreat_j_minus_7",
      retreatId: retreat.id,
      scheduledAt: atHourMs(retreat.startDate) - 7 * 86400000,
      title: `Dans 7 jours : ${retreat.title} — ${retreat.destinationLabel}`,
      body: "Verifie ta liste de preparation dans Serey Padma",
      updatedAt: now,
    });
    reminders.push({
      id: `j3p-${retreat.id}`,
      type: "retreat_j_plus_3",
      retreatId: retreat.id,
      scheduledAt: atHourMs(retreat.endDate) + 3 * 86400000,
      title: `Comment s'est passee ${retreat.title} ?`,
      body: "Pense a generer les journaux souvenirs pour tes participantes 🌸",
      updatedAt: now,
    });
  }

  for (const reservation of reservations) {
    if (reservation.paymentMode !== "deposit") continue;
    const balanceEuro = Math.max(0, (reservation.totalCents - reservation.dueNowCents) / 100);
    if (balanceEuro <= 0) continue;
    const retreat = retreats.find((r) => r.id === reservation.retreatId);
    if (!retreat) continue;
    const participant = participants.find((p) => p.sourceReservationId === reservation.id);
    const name = firstNameFromLabel(participant?.name ?? reservation.contactEmail);
    reminders.push({
      id: `j14-balance-${reservation.id}`,
      type: "balance_j_minus_14",
      retreatId: reservation.retreatId,
      participantId: participant?.id,
      scheduledAt: atHourMs(retreat.startDate) - 14 * 86400000,
      title: `Solde restant a regler : ${balanceEuro}€ pour ${name} — ${retreat.title}`,
      body: "Ouvre la reservation pour verifier le paiement final.",
      updatedAt: now,
    });
  }

  for (const r of reminders) {
    const prev = await db.reminderNotifications.get(r.id);
    await db.reminderNotifications.put({
      ...r,
      firedAt: prev?.firedAt,
    });
  }
}

export async function dispatchDueNotifications() {
  if (!db || typeof window === "undefined" || !("Notification" in window)) return;
  const prefs = await ensurePrefs();
  if (!prefs?.enabled) return;
  if (Notification.permission !== "granted") return;

  const reg = await navigator.serviceWorker.getRegistration("/");
  if (!reg) return;
  const now = Date.now();
  const due = await db.reminderNotifications.filter((r) => !r.firedAt && r.scheduledAt <= now).toArray();
  for (const r of due) {
    await reg.showNotification(r.title, {
      body: r.body,
      tag: r.id,
      data: { retreatId: r.retreatId, participantId: r.participantId, type: r.type },
      icon: "/serey_padma_lotus.png",
      badge: "/icon-192.svg",
    });
    await db.reminderNotifications.put({
      ...r,
      firedAt: now,
      updatedAt: now,
    });
  }
}
