"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/layout/brand-mark";

type AuthChromeProps = {
  /** `true` si les clés Supabase publiques sont présentes (auth cloud possible). */
  cloudAuthAvailable: boolean;
  /** E-mail de la session courante, si connectée. */
  sessionEmail: string | null;
};

/**
 * Bandeau léger en haut du groupe `(main)` : état **cloud / local**, e-mail, déconnexion.
 * Ne remplace pas le middleware ; informe simplement l’utilisatrice.
 */
export function AuthChrome({ cloudAuthAvailable, sessionEmail }: AuthChromeProps) {
  const router = useRouter();
  const showDemoBadge = process.env.NEXT_PUBLIC_SHOW_DEMO_BADGE !== "false";
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionEmail) return;
    const key = `padma-welcome:${sessionEmail}`;
    if (window.localStorage.getItem(key)) return;
    const firstName = sessionEmail.split("@")[0]?.split(/[.\-_]/)[0] ?? "belle ame";
    const prettyName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    setWelcomeMessage(`Bienvenue ${prettyName}, heureuse de t'accueillir dans ton sanctuaire.`);
    window.localStorage.setItem(key, "1");
  }, [sessionEmail]);

  async function signOut() {
    const client = createBrowserSupabaseClient();
    if (client) await client.auth.signOut();
    router.push("/connexion");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-padma-champagne/18 bg-padma-cream/85 backdrop-blur-xl dark:border-padma-lavender/18 dark:bg-padma-night/82">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 md:gap-3 md:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-padma-champagne dark:text-padma-lavender" aria-hidden />
          <BrandMark compact className="shrink-0" />
          {!cloudAuthAvailable && showDemoBadge && (
            <>
              <span className="hidden rounded-full border border-padma-champagne/35 bg-white/65 px-2 py-0.5 font-display text-[0.6rem] uppercase tracking-[0.12em] text-padma-night/72 shadow-sm dark:border-padma-lavender/30 dark:bg-padma-night/55 dark:text-padma-cream/75 sm:inline">
                Mode demo · local
              </span>
              <span className="truncate text-[0.7rem] text-padma-night/60 dark:text-padma-cream/65 sm:hidden">
                Demo · local
              </span>
              <span className="hidden truncate text-xs text-padma-night/58 dark:text-padma-cream/62 sm:inline">
                Données sur cet appareil · PWA
              </span>
            </>
          )}
          {cloudAuthAvailable && sessionEmail && (
            <span className="truncate font-display text-xs text-padma-night/75 dark:text-padma-cream/80" title={sessionEmail}>
              {sessionEmail}
            </span>
          )}
          {cloudAuthAvailable && !sessionEmail && (
            <span className="truncate text-xs text-padma-night/62 dark:text-padma-cream/68">
              Nuage disponible · pas encore connectée
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!cloudAuthAvailable && (
            <Link
              href="/connexion"
              className="text-xs font-medium text-oasis-reiki underline decoration-padma-champagne/55 underline-offset-4 dark:text-padma-champagne"
            >
              Cloud &amp; compte
            </Link>
          )}
          {cloudAuthAvailable && sessionEmail && (
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => void signOut()}>
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Déconnexion
            </Button>
          )}
        </div>
      </div>
      {welcomeMessage && (
        <div className="border-t border-padma-champagne/18 bg-white/55 px-4 py-2 text-center text-xs text-padma-night/75 dark:border-padma-lavender/18 dark:bg-padma-night/45 dark:text-padma-cream/78">
          {welcomeMessage}
        </div>
      )}
    </header>
  );
}
