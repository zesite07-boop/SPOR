"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function safeInternalPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

/**
 * Connexion par **magic link** (OTP email). Sans variables Supabase publiques, le formulaire
 * affiche un message : l’app reste utilisable en **mode local Dexie**.
 */
export function MagicLinkForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

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

    const client = createBrowserSupabaseClient();
    if (!client) {
      setFeedback({
        kind: "err",
        text: "Supabase n’est pas configuré sur cet environnement — tu restes en mode sanctuaire local.",
      });
      return;
    }

    const trimmed = email.trim();
    if (!trimmed) {
      setFeedback({ kind: "err", text: "Indique une adresse e-mail." });
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
            disabled={loading || !supabaseConfigured}
            className="w-full rounded-2xl border border-padma-champagne/45 bg-white/95 py-3.5 pl-11 pr-4 text-sm text-padma-night shadow-inner outline-none ring-0 transition-[border-color,box-shadow] placeholder:text-padma-night/35 focus:border-padma-lavender/80 focus:shadow-[0_0_0_3px_rgba(197,180,212,0.25)] dark:border-padma-lavender/35 dark:bg-padma-night/55 dark:text-padma-cream dark:placeholder:text-padma-cream/35"
          />
        </div>
      </div>

      {/* CTA principal — très visible, doux, premium (palette padma, typo Cinzel) */}
      <Button
        type="submit"
        variant="oracle"
        disabled={loading || !supabaseConfigured}
        size="lg"
        className="font-cinzel relative h-14 w-full overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-r from-padma-champagne via-padma-lavender to-padma-pearl/95 text-base font-medium tracking-[0.06em] text-padma-night shadow-[0_12px_40px_-12px_rgba(197,180,212,0.65)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_16px_44px_-10px_rgba(232,196,168,0.55)] dark:border-padma-lavender/25 dark:from-padma-champagne/88 dark:via-padma-lavender/85 dark:to-padma-pearl/80 dark:text-padma-night"
      >
        <Sparkles className="h-5 w-5 shrink-0 opacity-90" aria-hidden />
        Se connecter avec mon e-mail
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
