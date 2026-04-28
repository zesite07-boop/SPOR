"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flower2, Sparkles } from "lucide-react";
import { getNotificationPrefs, requestNotificationPermission, setNotificationsEnabled } from "@/lib/notifications/reminders";

export default function BienEtrePage() {
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "default">("default");
  const [notifEnabled, setNotifEnabledState] = useState(true);

  useEffect(() => {
    void (async () => {
      const prefs = await getNotificationPrefs();
      if (prefs) {
        setNotifEnabledState(prefs.enabled);
        setNotifPermission(prefs.permission);
      }
    })();
  }, []);

  return (
    <section className="space-y-6 pb-8">
      <header className="space-y-2">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-oasis-reiki dark:text-oasis-champagne">Module 3</p>
        <h1 className="font-display text-2xl font-semibold text-oasis-night dark:text-oasis-cream">Profil & Oracle</h1>
        <p className="text-sm leading-relaxed text-oasis-night/75 dark:text-oasis-cream/80">
          Astrologie, numérologie, tirages majeurs, journal bienveillant — tout le module Oracle vit aussi hors ligne.
        </p>
      </header>
      <Card className="border-padma-lavender/35 bg-gradient-to-br from-white/95 to-padma-lavender/10 dark:from-padma-night/60 dark:to-padma-lavender/10">
        <CardHeader>
          <Flower2 className="mb-1 h-6 w-6 text-padma-lavender" aria-hidden />
          <CardTitle className="font-cinzel text-xl font-normal tracking-wide text-padma-night dark:text-padma-cream">
            Module Oracle complet
          </CardTitle>
          <CardDescription>
            Chakras, chemin de vie, mensuel, retraite, tirage libre — historique Dexie et profil personnel.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild variant="oracle" className="font-cinzel gap-2 rounded-2xl">
            <Link href="/oracle">
              <Sparkles className="h-4 w-4" aria-hidden />
              Entrer dans le sanctuaire des tirages
            </Link>
          </Button>
          <p className="text-sm text-oasis-night/70 dark:text-oasis-cream/75">
            Les calculs restent locaux ; les textes sont poétiques et jamais culpabilisants.
          </p>
        </CardContent>
      </Card>
      <Card className="border-padma-champagne/35 bg-white/85 dark:bg-padma-night/60">
        <CardHeader>
          <CardTitle className="font-cinzel text-xl font-normal tracking-wide text-padma-night dark:text-padma-cream">
            Notifications locales PWA
          </CardTitle>
          <CardDescription>Rappels J-7, soldes et suivis post-retraite, sans API externe.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-padma-night/75 dark:text-padma-cream/80">Permission actuelle : {notifPermission}</p>
          {notifPermission !== "granted" && (
            <Button
              type="button"
              variant="oracle"
              className="rounded-2xl font-cinzel"
              onClick={() =>
                void (async () => {
                  const p = await requestNotificationPermission();
                  setNotifPermission(p);
                })()
              }
            >
              Activer les rappels
            </Button>
          )}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="rounded-2xl"
              onClick={() =>
                void (async () => {
                  const next = !notifEnabled;
                  await setNotificationsEnabled(next);
                  setNotifEnabledState(next);
                })()
              }
            >
              {notifEnabled ? "Desactiver les rappels" : "Reactiver les rappels"}
            </Button>
            <p className="text-xs text-padma-night/65 dark:text-padma-cream/70">{notifEnabled ? "Rappels actifs" : "Rappels suspendus"}</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
