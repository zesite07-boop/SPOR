"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { generateTwoFactorSetup, saveTwoFactorConfig, verifyTwoFactorCode } from "@/lib/security/twofa";

export default function TwoFactorSetupPage() {
  const router = useRouter();
  const [accountLabel, setAccountLabel] = useState("celine@sereypadma.local");
  const [secret, setSecret] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "invalid" | "ok">("idle");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const setup = await generateTwoFactorSetup(accountLabel);
      if (cancelled) return;
      setSecret(setup.secret);
      setQrDataUrl(setup.qrDataUrl);
    })();
    return () => {
      cancelled = true;
    };
  }, [accountLabel]);

  async function confirmSetup() {
    await saveTwoFactorConfig({ secret, accountLabel });
    const check = await verifyTwoFactorCode(code);
    if (!check.ok) {
      setStatus("invalid");
      return;
    }
    setStatus("ok");
    router.push("/bien-etre");
  }

  return (
    <main className="padma-aura-bg min-h-dvh px-4 py-10">
      <div className="mx-auto max-w-md rounded-[1.75rem] border border-padma-champagne/35 bg-white/85 p-6 shadow-soft dark:border-padma-lavender/25 dark:bg-padma-night/60">
        <BrandMark />
        <h1 className="mt-4 font-cinzel text-2xl text-padma-night dark:text-padma-cream">Setup 2FA TOTP</h1>
        <p className="mt-2 text-sm text-padma-night/75 dark:text-padma-cream/80">
          Scannez ce QR code avec Google Authenticator ou Microsoft Authenticator.
        </p>

        <label className="mt-4 block text-xs uppercase tracking-wide text-padma-night/60 dark:text-padma-cream/65">
          Identifiant 2FA
          <input
            value={accountLabel}
            onChange={(e) => setAccountLabel(e.target.value)}
            className="mt-1 w-full rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
          />
        </label>

        {qrDataUrl && (
          <Image
            src={qrDataUrl}
            alt="QR code TOTP setup"
            width={224}
            height={224}
            className="mx-auto mt-4 h-56 w-56 rounded-xl border border-padma-champagne/35 bg-white p-2"
          />
        )}

        <p className="mt-3 break-all rounded-lg bg-padma-cream/45 px-3 py-2 text-[11px] text-padma-night/78 dark:bg-padma-night/45 dark:text-padma-cream/80">
          Secret: {secret}
        </p>

        <label className="mt-3 block text-xs uppercase tracking-wide text-padma-night/60 dark:text-padma-cream/65">
          Code de verification
          <input
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D+/g, "").slice(0, 6))}
            placeholder="000000"
            className="mt-1 w-full rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
          />
        </label>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button type="button" variant="oracle" className="rounded-xl font-cinzel" onClick={() => void confirmSetup()}>
            Confirmer
          </Button>
          <Button asChild type="button" variant="secondary" className="rounded-xl">
            <Link href="/bien-etre">Annuler</Link>
          </Button>
        </div>
        {status === "invalid" && <p className="mt-2 text-xs text-red-600 dark:text-red-300">Code invalide ou expiré.</p>}
        {status === "ok" && <p className="mt-2 text-xs text-green-700 dark:text-green-300">2FA active avec succès.</p>}
      </div>
    </main>
  );
}
