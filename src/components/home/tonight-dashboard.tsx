"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db, type MarketingQueueItem, type ReservationRecord } from "@/lib/db/schema";
import { listUpcomingRetreats } from "@/lib/reservation/catalog";
import { getMoonDayInfo } from "@/lib/cosmic/lunar";
import { getDailyEnergyMessage } from "@/lib/home/daily-energy-message";
import { loadLocalProfile } from "@/lib/db/profile-local";

function daysUntil(startIso: string): number {
  const t = new Date(startIso + "T12:00:00").getTime();
  return Math.max(0, Math.ceil((t - Date.now()) / 86400000));
}

export function TonightDashboard() {
  const [pendingReservations, setPendingReservations] = useState(0);
  const [nextContent, setNextContent] = useState<string>("Aucun contenu en file");
  const [firstName, setFirstName] = useState<string | undefined>(undefined);

  const moon = useMemo(() => getMoonDayInfo(new Date()), []);
  const energyLine = useMemo(() => getDailyEnergyMessage(new Date(), firstName), [firstName]);
  const nextRetreat = useMemo(() => listUpcomingRetreats()[0], []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!db) return;
      const reservations = await db.reservations.toArray();
      const queue = await db.marketingQueue.toArray();
      const profile = await loadLocalProfile();
      if (cancelled) return;

      const pending = reservations.filter((r: ReservationRecord) =>
        r.status === "checkout_pending" || r.status === "checkout_created" || r.status === "draft"
      ).length;
      setPendingReservations(pending);

      const next = queue
        .sort((a: MarketingQueueItem, b: MarketingQueueItem) => a.sortOrder - b.sortOrder)
        .find((q: MarketingQueueItem) => !q.done);
      setNextContent(next?.label ?? "Aucun contenu en file");

      const n = profile?.displayName?.trim();
      if (n) setFirstName(n.split(/\s+/)[0]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card className="border-padma-champagne/30 bg-white/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Ce soir</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>Reservations en attente : {pendingReservations}</p>
        <p>Prochain contenu : {nextContent}</p>
        <p>Phase lunaire : {moon.labelFr}</p>
        <p className="line-clamp-2">Energie du jour : {energyLine}</p>
        <p>
          Prochaine retraite : {nextRetreat ? `${nextRetreat.title} (J-${daysUntil(nextRetreat.startDate)})` : "Aucune retraite"}
        </p>
      </CardContent>
    </Card>
  );
}
