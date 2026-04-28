"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getTwoFactorConfig, isTwoFactorSessionValid, verifyTwoFactorCode } from "@/lib/security/twofa";
import { BrandMark } from "@/components/layout/brand-mark";

export function TwofaAuthPageClient() {
  const params = useSearchParams();
  const router = useRouter();
  const next = useMemo(() => params.get("next") || "/rayonner", [params]);
  const reason = useMemo(() => params.get("reason"), [params]);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "invalid" | "expired" | "valid">("idle");
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const cfg = await getTwoFactorConfig();
      const validSession = await isTwoFactorSessionValid();
      if (cancelled) return;
      if (!cfg?.enabled) setNeedsSetup(true);
      if (validSession) router.replace(next);
      if (reason === "expired") setStatus("expired");
    })();
    return () => {
      cancelled = true;
    };
  }, [next, reason, router]);

  async function submit() {
    const result = await verifyTwoFactorCode(code);
    if (!result.ok) {
      setStatus(result.reason === "invalid" ? "invalid" : "expired");
      return;
    }
    setStatus("valid");
    router.replace(next);
  }

  return (
    <main className="padma-aura-bg min-h-dvh px-4 py-10">
      <div className="mx-auto max-w-md rounded-[1.75rem] border border-padma-champagne/35 bg-white/85 p-6 shadow-soft dark:border-padma-lavender/25 dark:bg-padma-night/60">
        <BrandMark />
        <h1 className="mt-4 font-cinzel text-2xl text-padma-night dark:text-padma-cream">Authentification 2FA</h1>
        <p className="mt-2 text-sm text-padma-night/75 dark:text-padma-cream/80">Modules reserves — entrez votre code d&apos;authentification</p>
        <p className="mt-1 text-xs text-padma-night/60 dark:text-padma-cream/68">Compatible Google Authenticator, Microsoft Authenticator, Authy.</p>

        {needsSetup ? (
          <div className="mt-5 rounded-xl border border-padma-champagne/35 bg-padma-cream/45 p-4 text-sm dark:border-padma-lavender/30 dark:bg-padma-night/45">
            <p>Le 2FA n&apos;est pas encore configure.</p>
            <Button asChild className="mt-3 w-full rounded-xl font-cinzel">
              <Link href="/auth/2fa/setup">Configurer le 2FA</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D+/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full rounded-xl border border-padma-champagne/40 bg-white px-4 py-3 text-center text-2xl tracking-[0.4em] text-padma-night dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
            />
            <Button type="button" variant="oracle" className="w-full rounded-xl font-cinzel" onClick={() => void submit()}>
              Valider le code
            </Button>
            {status === "invalid" && <p className="text-xs text-red-600 dark:text-red-300">Code invalide.</p>}
            {status === "expired" && <p className="text-xs text-amber-700 dark:text-amber-300">Session expirée, merci de revalider.</p>}
            {status === "valid" && <p className="text-xs text-green-700 dark:text-green-300">Code valide, ouverture en cours...</p>}
          </div>
        )}
      </div>
    </main>
  );
}
