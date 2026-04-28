"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, History, Sparkles, UserRound } from "lucide-react";
import type { OasisProfile } from "@/lib/db/schema";
import { loadLocalProfile } from "@/lib/db/profile-local";
import { Button } from "@/components/ui/button";
import { OracleDrawsPanel } from "@/components/oracle/oracle-draws-panel";
import { OracleProfilePanel } from "@/components/oracle/oracle-profile-panel";
import { OracleHistoryPanel } from "@/components/oracle/oracle-history-panel";
import { HyperfocusToolbar } from "@/components/layout/hyperfocus-toolbar";
import { SectionSeparator } from "@/components/ui/section-separator";
import { cn } from "@/lib/utils";

type OracleTab = "draws" | "profile" | "history";

/**
 * Module Oracle Serey Padma — tirages avancés, profil astro/num/tarot, historique Dexie.
 * Fonctionne entièrement hors ligne après chargement de la page.
 */
export default function OracleModulePage() {
  const [tab, setTab] = useState<OracleTab>("draws");
  const [profile, setProfile] = useState<OasisProfile | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    void loadLocalProfile().then(setProfile);
  }, [refreshKey]);

  const bump = useCallback(() => {
    setRefreshKey((k) => k + 1);
    void loadLocalProfile().then(setProfile);
  }, []);

  const mainTabs: { id: OracleTab; label: string; Icon: typeof Sparkles }[] = [
    { id: "draws", label: "Tirages", Icon: Sparkles },
    { id: "profile", label: "Profil oracle", Icon: UserRound },
    { id: "history", label: "Historique", Icon: History },
  ];

  return (
    <div className="pb-12">
      <header className="padma-hero-halo mb-8 space-y-4">
        <Link
          href="/bien-etre"
          className="inline-flex items-center gap-2 text-xs font-medium text-padma-night/60 transition hover:text-padma-lavender dark:text-padma-cream/60 dark:hover:text-padma-champagne"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Bien-être &amp; portrait
        </Link>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="font-display text-xs uppercase tracking-[0.28em] text-padma-pearl dark:text-padma-lavender/90">
            Module Oracle
          </p>
          <h1 className="page-title mt-2 font-cinzel font-normal tracking-[0.08em] text-padma-night dark:text-padma-cream">
            Sanctuaire des tirages
          </h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-padma-night/78 dark:text-padma-cream/82">
            Chakras, chemin de vie, cycles mensuels, retraite et tirage libre — textes toujours bienveillants, tissés avec
            astrologie et numérologie.
          </p>
        </motion.div>
        <HyperfocusToolbar />
      </header>

      <SectionSeparator className="mb-6" />

      <div className="mb-8 flex flex-wrap gap-2 border-b border-padma-champagne/25 pb-4 dark:border-padma-lavender/20">
        {mainTabs.map(({ id, label, Icon }) => (
          <Button
            key={id}
            type="button"
            variant={tab === id ? "oracle" : "ghost"}
            size="sm"
            className={cn(
              "gap-2 rounded-full font-cinzel",
              tab === id ? "shadow-soft" : "text-padma-night/70 dark:text-padma-cream/75"
            )}
            onClick={() => setTab(id)}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Button>
        ))}
        <Button asChild variant="secondary" size="sm" className="ml-auto rounded-full gap-2">
          <Link href="/">
            <BookOpen className="h-4 w-4" aria-hidden />
            Accueil
          </Link>
        </Button>
      </div>

      {tab === "draws" && <OracleDrawsPanel profile={profile} onSaved={bump} />}
      {tab === "profile" && <OracleProfilePanel refreshKey={refreshKey} />}
      {tab === "history" && <OracleHistoryPanel refreshKey={refreshKey} />}
    </div>
  );
}
