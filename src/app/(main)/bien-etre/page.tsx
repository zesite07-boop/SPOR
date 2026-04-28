"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flower2, Sparkles } from "lucide-react";
import { getNotificationPrefs, requestNotificationPermission, setNotificationsEnabled } from "@/lib/notifications/reminders";
import {
  disableTwoFactorWithCode,
  generateTwoFactorSetup,
  getTwoFactorConfig,
  isAdminSessionValid,
  saveTwoFactorConfig,
  verifyTwoFactorCode,
} from "@/lib/security/twofa";

export default function BienEtrePage() {
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "default">("default");
  const [notifEnabled, setNotifEnabledState] = useState(true);
  const [twofaEnabled, setTwofaEnabled] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [twofaStatus, setTwofaStatus] = useState<string | null>(null);
  const [adminSession, setAdminSession] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupLabel, setSetupLabel] = useState("celine@sereypadma.local");
  const [setupSecret, setSetupSecret] = useState("");
  const [setupQr, setSetupQr] = useState("");
  const [setupCode, setSetupCode] = useState("");

  useEffect(() => {
    void (async () => {
      const prefs = await getNotificationPrefs();
      if (prefs) {
        setNotifEnabledState(prefs.enabled);
        setNotifPermission(prefs.permission);
      }
      const cfg = await getTwoFactorConfig();
      setTwofaEnabled(!!cfg?.enabled);
      setAdminSession(await isAdminSessionValid());
    })();
  }, []);

  useEffect(() => {
    if (!setupOpen || !adminSession) return;
    let cancelled = false;
    void (async () => {
      const setup = await generateTwoFactorSetup(setupLabel);
      if (cancelled) return;
      setSetupSecret(setup.secret);
      setSetupQr(setup.qrDataUrl);
    })();
    return () => {
      cancelled = true;
    };
  }, [setupOpen, setupLabel, adminSession]);

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
      {adminSession && (
        <Card className="border-padma-lavender/35 bg-white/85 dark:bg-padma-night/60">
        <CardHeader>
          <CardTitle className="font-cinzel text-xl font-normal tracking-wide text-padma-night dark:text-padma-cream">Sécurité</CardTitle>
          <CardDescription>Modules protégés : Rayonner (`/rayonner`) et Trésor (`/tresor`). Session 2FA valable 8h.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-padma-night/75 dark:text-padma-cream/80">2FA : {twofaEnabled ? "Activé" : "Désactivé"}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="oracle" className="rounded-2xl font-cinzel" onClick={() => setSetupOpen((v) => !v)}>
              {setupOpen ? "Fermer la configuration" : "Configurer le 2FA"}
            </Button>
          </div>
          {setupOpen && (
            <div className="space-y-2 rounded-xl border border-padma-lavender/35 bg-padma-cream/45 p-3 dark:border-padma-lavender/30 dark:bg-padma-night/45">
              <p className="text-xs text-padma-night/70 dark:text-padma-cream/75">
                Scannez ce QR code avec Google Authenticator ou Microsoft Authenticator.
              </p>
              <input
                value={setupLabel}
                onChange={(e) => setSetupLabel(e.target.value)}
                className="w-full rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
              />
              {setupQr && (
                <Image
                  src={setupQr}
                  alt="QR setup 2FA"
                  width={220}
                  height={220}
                  className="mx-auto rounded-xl border border-padma-champagne/35 bg-white p-2"
                />
              )}
              <p className="break-all rounded-lg bg-white/70 px-2 py-1 text-[11px] text-padma-night/70 dark:bg-padma-night/60 dark:text-padma-cream/72">
                Secret: {setupSecret}
              </p>
              <input
                inputMode="numeric"
                maxLength={6}
                value={setupCode}
                onChange={(e) => setSetupCode(e.target.value.replace(/\D+/g, "").slice(0, 6))}
                placeholder="Code de verification"
                className="w-full rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
              />
              <Button
                type="button"
                className="rounded-2xl"
                onClick={() =>
                  void (async () => {
                    await saveTwoFactorConfig({ secret: setupSecret, accountLabel: setupLabel });
                    const res = await verifyTwoFactorCode(setupCode);
                    if (res.ok) {
                      setTwofaEnabled(true);
                      setTwofaStatus("2FA active avec succès.");
                      setSetupCode("");
                      setSetupOpen(false);
                    } else {
                      setTwofaStatus("Code invalide, vérifie le scan et réessaie.");
                    }
                  })()
                }
              >
                Confirmer le setup
              </Button>
            </div>
          )}
          {twofaEnabled && (
            <div className="space-y-2 rounded-xl border border-padma-champagne/35 bg-padma-cream/45 p-3 dark:border-padma-lavender/30 dark:bg-padma-night/45">
              <p className="text-xs text-padma-night/70 dark:text-padma-cream/75">Désactivation sécurisée : entrez un code TOTP valide.</p>
              <input
                inputMode="numeric"
                maxLength={6}
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D+/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
              />
              <Button
                type="button"
                variant="secondary"
                className="rounded-2xl"
                onClick={() =>
                  void (async () => {
                    const res = await disableTwoFactorWithCode(disableCode);
                    if (res.ok) {
                      setTwofaEnabled(false);
                      setTwofaStatus("2FA désactivé.");
                      setDisableCode("");
                    } else {
                      setTwofaStatus("Code invalide, désactivation refusée.");
                    }
                  })()
                }
              >
                Désactiver le 2FA
              </Button>
              {twofaStatus && <p className="text-xs text-padma-night/75 dark:text-padma-cream/78">{twofaStatus}</p>}
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </section>
  );
}
