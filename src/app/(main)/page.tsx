"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LandingPortalGrid } from "@/components/home/landing-portal-grid";
import { HyperfocusToolbar } from "@/components/layout/hyperfocus-toolbar";
import { VoiceHint } from "@/components/home/voice-hint";
import { CosmicCalendarSection } from "@/components/home/cosmic-calendar-section";
import { DailyEnergySection } from "@/components/home/daily-energy-section";
import { DailyOracleDraw } from "@/components/home/daily-oracle-draw";
import { TonightDashboard } from "@/components/home/tonight-dashboard";
import { SectionSeparator } from "@/components/ui/section-separator";
import { loadLocalProfile } from "@/lib/db/profile-local";
import { useUiStore } from "@/stores/ui-store";
import { useEffect, useState } from "react";

/**
 * Accueil Serey Padma — landing vivante + calendrier cosmique, oracle du jour, énergie journalière.
 */
export default function AccueilPage() {
  const hyperfocus = useUiStore((s) => s.hyperfocus);
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const p = await loadLocalProfile();
      const n = p?.displayName?.trim();
      if (n) setFirstName(n.split(/\s+/)[0]);
    })();
  }, []);

  return (
    <>
      <header className="padma-hero-halo mb-10 space-y-5">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-display text-sm uppercase tracking-[0.25em] text-padma-pearl"
        >
          Bienvenue dans ton sanctuaire
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="page-title font-cinzel font-normal tracking-[0.08em] text-padma-night"
        >
          Serey Padma by Céline
        </motion.h1>
        <p className="font-display text-xs uppercase tracking-[0.22em] text-padma-night/58">
          Reiki · Oracle · Retreats
        </p>
        <p className="max-w-prose text-[1.05rem] leading-relaxed text-padma-night/82">
          Un ecrin numerique pour respirer avec la Lune, honorer les transits et recevoir un oracle bienveillant - meme quand la
          connexion fait une pause.
        </p>
        <p className="max-w-prose text-sm leading-relaxed text-padma-night/68">
          Ici, rien ne te presse : les donnees sensibles restent d&apos;abord chez toi (Dexie &amp; PWA). Le nuage n&apos;est
          qu&apos;une invitation, jamais une obligation.
        </p>
        <p className="text-xs text-padma-night/55">
          <Link
            href="/connexion"
            className="underline decoration-padma-champagne/55 underline-offset-4 transition-colors hover:text-padma-lavender"
          >
            Se connecter (magic link)
          </Link>
          {" · "}
          <Link
            href="/reservation"
            className="underline decoration-padma-champagne/55 underline-offset-4 transition-colors hover:text-padma-lavender"
          >
            Voir les retraites
          </Link>
          {" · "}
          <Link
            href="/landing"
            className="underline decoration-padma-champagne/55 underline-offset-4 transition-colors hover:text-padma-lavender"
          >
            Landing publique
          </Link>
        </p>
        <HyperfocusToolbar />
        <VoiceHint />
        {firstName ? (
          <p className="font-cinzel text-xl text-padma-night">Bonjour {firstName}</p>
        ) : null}
      </header>

      <LandingPortalGrid hyperfocus={hyperfocus} />

      <div className="mt-14 flex flex-col gap-12 pb-12">
        <SectionSeparator />
        <CosmicCalendarSection />
        <SectionSeparator />
        <TonightDashboard />
        <SectionSeparator />
        <DailyOracleDraw />
        <SectionSeparator />
        <DailyEnergySection />
      </div>
    </>
  );
}
