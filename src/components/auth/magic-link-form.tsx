"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  generateTwoFactorSetup,
  getTwoFactorConfig,
  isAllowedAdminEmail,
  saveTwoFactorConfig,
  startAdminSession,
  verifyTwoFactorCode,
} from "@/lib/security/twofa";

function safeInternalPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

/**
 * Connexion par **magic link** (OTP email). Sans variables Supabase publiques, le formulaire
 * affiche un message : l’app reste utilisable en **mode local Dexie**.
 */
export function MagicLinkForm({ allowedEmails = [] }: { allowedEmails?: string[] }) {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [twofaConfigured, setTwofaConfigured] = useState<boolean | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [setupSecret, setSetupSecret] = useState("");
  const [setupQr, setSetupQr] = useState("");
  const [setupCode, setSetupCode] = useState("");

  const supabaseConfigured = useMemo(() => {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }, []);

  const authErrorHint = useMemo(() => {
    if (urlError === "session") {
      return "Le lien a expiré ou est invalide. Demande un nouveau lien ci-dessous.";
    }
    return null;
  }, [urlError]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setFeedback({ kind: "err", text: "Indique une adresse e-mail." });
      return;
    }

    if (adminEmail) {
      const result = await verifyTwoFactorCode(totpCode);
      if (!result.ok) {
        setFeedback({ kind: "err", text: "Code invalide ou expiré." });
        return;
      }
      await startAdminSession(adminEmail);
      setFeedback({ kind: "ok", text: "Bienvenue, espace complet activé." });
      window.location.href = safeInternalPath(searchParams.get("next"));
      return;
    }

    if (isAllowedAdminEmail(trimmed, allowedEmails)) {
      setAdminEmail(trimmed);
      const cfg = await getTwoFactorConfig();
      setTwofaConfigured(!!cfg?.enabled);
      setFeedback(null);
      return;
    }

    const client = createBrowserSupabaseClient();
    if (!client) {
      setFeedback({
        kind: "err",
        text: "Supabase n’est pas configuré sur cet environnement — tu restes en mode sanctuaire local.",
      });
      return;
    }

    setLoading(true);
    try {
      const next = safeInternalPath(searchParams.get("next"));
      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("next", next);

      const { error } = await client.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: callback.toString(),
        },
      });

      if (error) {
        setFeedback({ kind: "err", text: error.message });
        return;
      }

      setFeedback({
        kind: "ok",
        text: "Un lien sacré vient de partir vers ta boîte mail. Ouvre-le pour entrer dans l’espace Serey Padma.",
      });
      setEmail("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-6">
      {authErrorHint && (
        <p className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-center text-sm text-red-900/90 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-100/95">
          {authErrorHint}
        </p>
      )}

      <div className="space-y-2">
        <label htmlFor="padma-email" className="block text-xs font-medium tracking-wide text-padma-night/65 dark:text-padma-cream/70">
          Ton e-mail
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-padma-lavender dark:text-padma-champagne/90"
            aria-hidden
          />
          <input
            id="padma-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@sereypadma.app"
            disabled={loading}
            className="w-full rounded-2xl border border-padma-champagne/45 bg-white/95 py-3.5 pl-11 pr-4 text-sm text-padma-night shadow-inner outline-none ring-0 transition-[border-color,box-shadow] placeholder:text-padma-night/35 focus:border-padma-lavender/80 focus:shadow-[0_0_0_3px_rgba(197,180,212,0.25)] dark:border-padma-lavender/35 dark:bg-padma-night/55 dark:text-padma-cream dark:placeholder:text-padma-cream/35"
          />
        </div>
      </div>

      {adminEmail && (
        <div className="space-y-2">
          <label htmlFor="padma-totp" className="block text-xs font-medium tracking-wide text-padma-night/65 dark:text-padma-cream/70">
            Code d&apos;authentification (6 chiffres)
          </label>
          <input
            id="padma-totp"
            inputMode="numeric"
            maxLength={6}
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D+/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full rounded-2xl border border-padma-champagne/45 bg-white/95 py-3.5 px-4 text-center text-xl tracking-[0.34em] text-padma-night outline-none focus:border-padma-lavender/80 dark:border-padma-lavender/35 dark:bg-padma-night/55 dark:text-padma-cream"
          />
          <p className="text-xs text-padma-night/55 dark:text-padma-cream/60">
            Modules réservés — entrez votre code d&apos;authentification.
          </p>
          {twofaConfigured === false && (
            <div className="rounded-xl border border-padma-champagne/35 bg-padma-cream/45 p-3 text-xs text-padma-night/72 dark:border-padma-lavender/30 dark:bg-padma-night/45 dark:text-padma-cream/78">
              <p>Première connexion ? Configurez votre authentificateur.</p>
              <button
                type="button"
                className="mt-1 underline decoration-padma-champagne/60 underline-offset-4"
                onClick={() =>
                  void (async () => {
                    const setup = await generateTwoFactorSetup(adminEmail);
                    setSetupSecret(setup.secret);
                    setSetupQr(setup.qrDataUrl);
                    setShowSetup(true);
                  })()
                }
              >
                Configurer la sécurité
              </button>
            </div>
          )}
          {showSetup && (
            <div className="space-y-2 rounded-xl border border-padma-lavender/35 bg-white/75 p-3 dark:border-padma-lavender/30 dark:bg-padma-night/45">
              <p className="text-xs text-padma-night/72 dark:text-padma-cream/78">
                Scannez ce QR code avec Google Authenticator ou Microsoft Authenticator.
              </p>
              {setupQr && (
                <Image
                  src={setupQr}
                  alt="QR setup 2FA"
                  width={180}
                  height={180}
                  className="mx-auto rounded-lg border border-padma-champagne/35 bg-white p-2"
                />
              )}
              <p className="break-all rounded-lg bg-white/70 px-2 py-1 text-[10px] text-padma-night/70 dark:bg-padma-night/60 dark:text-padma-cream/72">
                Secret: {setupSecret}
              </p>
              <input
                inputMode="numeric"
                maxLength={6}
                value={setupCode}
                onChange={(e) => setSetupCode(e.target.value.replace(/\D+/g, "").slice(0, 6))}
                placeholder="Code de vérification"
                className="w-full rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
              />
              <Button
                type="button"
                variant="secondary"
                className="w-full rounded-xl"
                onClick={() =>
                  void (async () => {
                    await saveTwoFactorConfig({ secret: setupSecret, accountLabel: adminEmail });
                    const checked = await verifyTwoFactorCode(setupCode);
                    if (!checked.ok) {
                      setFeedback({ kind: "err", text: "Code de setup invalide. Réessaie." });
                      return;
                    }
                    setTwofaConfigured(true);
                    setShowSetup(false);
                    setFeedback({ kind: "ok", text: "Authentificateur configuré. Entre un code pour finaliser." });
                  })()
                }
              >
                Valider le setup
              </Button>
            </div>
          )}
        </div>
      )}

      {/* CTA principal — très visible, doux, premium (palette padma, typo Cinzel) */}
      <Button
        type="submit"
        variant="oracle"
        disabled={loading}
        size="lg"
        className="font-cinzel relative h-14 w-full overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-r from-padma-champagne via-padma-lavender to-padma-pearl/95 text-base font-medium tracking-[0.06em] text-padma-night shadow-[0_12px_40px_-12px_rgba(197,180,212,0.65)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_16px_44px_-10px_rgba(232,196,168,0.55)] dark:border-padma-lavender/25 dark:from-padma-champagne/88 dark:via-padma-lavender/85 dark:to-padma-pearl/80 dark:text-padma-night"
      >
        <Sparkles className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
        {adminEmail ? "Valider mon code 2FA" : "Se connecter avec mon e-mail"}
      </Button>

      {!supabaseConfigured && (
        <p className="text-center text-xs leading-relaxed text-padma-night/55 dark:text-padma-cream/55">
          Variables <code className="rounded bg-padma-pearl/25 px-1 py-0.5 text-[0.65rem] dark:bg-padma-night/60">NEXT_PUBLIC_SUPABASE_*</code> absentes
          : navigation et Dexie fonctionnent sans cloud.
        </p>
      )}

      {feedback && (
        <p
          className={`text-center text-sm leading-relaxed ${
            feedback.kind === "ok"
              ? "text-padma-night/80 dark:text-padma-cream/85"
              : "text-red-700 dark:text-red-300/95"
          }`}
        >
          {feedback.text}
        </p>
      )}

      <p className="text-center text-[11px] leading-relaxed text-padma-night/45 dark:text-padma-cream/45">
        En continuant, tu acceptes de recevoir un lien de connexion ponctuel. Aucun mot de passe n’est stocké sur nos serveurs
        — la session vit dans un cookie sécurisé.
      </p>
    </form>
  );
}
