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
    <header className="sticky top-0 z-40 border-b border-[#e8e4f0] bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 md:gap-3 md:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-[#c9847a]" aria-hidden />
          <BrandMark compact className="shrink-0" />
          {!cloudAuthAvailable && showDemoBadge && (
            <>
              <span className="hidden rounded-full border border-[#bfa88266] bg-[#f8f7ff] px-2 py-0.5 font-display text-[0.6rem] uppercase tracking-[0.12em] text-[#3d3650] shadow-sm sm:inline">
                Mode demo · local
              </span>
              <span className="truncate text-[0.7rem] text-[#7a7090] sm:hidden">
                Demo · local
              </span>
              <span className="hidden truncate text-xs text-[#7a7090] sm:inline">
                Données sur cet appareil · PWA
              </span>
            </>
          )}
          {cloudAuthAvailable && sessionEmail && (
            <span className="truncate font-display text-xs text-[#3d3650]" title={sessionEmail}>
              {sessionEmail}
            </span>
          )}
          {cloudAuthAvailable && !sessionEmail && (
            <span className="truncate text-xs text-[#7a7090]">
              Nuage disponible · pas encore connectée
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!cloudAuthAvailable && (
            <Link
              href="/connexion"
              className="text-xs font-medium text-[#7c6faf] underline decoration-[#bfa882] underline-offset-4"
            >
              Cloud &amp; compte
            </Link>
          )}
          {cloudAuthAvailable && sessionEmail && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-[#3d3650] hover:bg-[#f8f7ff]"
              onClick={() => void signOut()}
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Déconnexion
            </Button>
          )}
        </div>
      </div>
      {welcomeMessage && (
        <div className="border-t border-[#e8e4f0] bg-[#f8f7ff] px-4 py-2 text-center text-xs text-[#3d3650]">
          {welcomeMessage}
        </div>
      )}
    </header>
  );
}
