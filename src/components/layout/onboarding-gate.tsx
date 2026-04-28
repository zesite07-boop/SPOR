"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db/schema";
import { requestNotificationPermission, setNotificationPermissionState } from "@/lib/notifications/reminders";
import { saveLocalProfile } from "@/lib/db/profile-local";

const ONBOARDING_KEY = "onboarding-done";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [notifBusy, setNotifBusy] = useState(false);

  const skipForPath = useMemo(() => pathname === "/landing" || pathname.startsWith("/api"), [pathname]);

  useEffect(() => {
    if (skipForPath || !db) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      const done = await db.events.get(ONBOARDING_KEY);
      if (!cancelled) {
        setShow(!done);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [skipForPath]);

  async function finish() {
    if (!db) return;
    await saveLocalProfile({
      displayName: name.trim() || "Belle ame",
      fullName: name.trim() || "Belle ame",
      birthDate: birthDate || undefined,
    });
    await db.events.put({
      id: ONBOARDING_KEY,
      title: "Onboarding completed",
      startAt: Date.now(),
      updatedAt: Date.now(),
    });
    setShow(false);
    router.push("/");
    router.refresh();
  }

  if (loading) return <>{children}</>;

  return (
    <>
      {children}
      {show && (
        <div className="fixed inset-0 z-[100] padma-aura-bg flex items-center justify-center p-4">
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-padma-lavender/30 blur-3xl" />
          </div>
          <div className="relative w-full max-w-md rounded-[1.75rem] border border-padma-champagne/35 bg-white/82 p-7 shadow-soft backdrop-blur-md">
            <div className="mb-4 flex justify-center">
              <Image src="/serey_padma_lotus.png" alt="Lotus Serey Padma" width={120} height={120} className="h-24 w-auto object-contain" />
            </div>
            {step === 0 && (
              <div className="space-y-4 text-center">
                <h2 className="font-cinzel text-2xl text-padma-night">Bienvenue dans ton sanctuaire</h2>
                <p className="text-sm text-padma-night/72">Serey Padma by Céline · Reiki · Oracle · Retreats</p>
                <Button type="button" variant="oracle" className="w-full rounded-2xl font-cinzel" onClick={() => setStep(1)}>
                  Commencer
                </Button>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-center font-cinzel text-xl text-padma-night">Quel est ton prenom ?</h2>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ton prenom"
                  className="w-full rounded-xl border border-padma-champagne/40 bg-white/90 px-3 py-2.5 text-sm text-padma-night"
                />
                <Button type="button" variant="oracle" className="w-full rounded-2xl font-cinzel" onClick={() => setStep(2)}>
                  Continuer
                </Button>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-center font-cinzel text-xl text-padma-night">Quelle est ta date de naissance ?</h2>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full rounded-xl border border-padma-champagne/40 bg-white/90 px-3 py-2.5 text-sm text-padma-night"
                />
                <Button type="button" variant="oracle" className="w-full rounded-2xl font-cinzel" onClick={() => setStep(3)}>
                  Continuer
                </Button>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-center font-cinzel text-xl text-padma-night">Activer les rappels locaux ?</h2>
                <p className="text-center text-sm text-padma-night/70">
                  Recois les rappels J-7, soldes et suivis post-retraite, meme hors ligne.
                </p>
                <Button
                  type="button"
                  variant="oracle"
                  className="w-full rounded-2xl font-cinzel"
                  disabled={notifBusy}
                  onClick={() =>
                    void (async () => {
                      setNotifBusy(true);
                      await requestNotificationPermission();
                      setNotifBusy(false);
                      await finish();
                    })()
                  }
                >
                  {notifBusy ? "Activation..." : "Activer les rappels"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full rounded-2xl"
                  onClick={() =>
                    void (async () => {
                      await setNotificationPermissionState("default", true);
                      await finish();
                    })()
                  }
                >
                  Passer pour maintenant
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
