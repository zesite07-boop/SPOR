"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarHeart, Sparkles } from "lucide-react";
import { listUpcomingRetreats } from "@/lib/reservation/catalog";
import { filterRetreats, type RetreatFilters } from "@/lib/reservation/filter-retreats";
import { RetreatCard } from "@/components/reservation/retreat-card";
import { RetreatFiltersBar } from "@/components/reservation/retreat-filters";
import { HyperfocusToolbar } from "@/components/layout/hyperfocus-toolbar";

const defaultFilters: RetreatFilters = {
  duration: "all",
  destination: "all",
  energy: "all",
};

/**
 * Liste des retraites à venir — données catalogue local + filtres.
 * Les réservations et paiements sont détaillées sur `/reservation/[id]`.
 */
export default function ReservationListPage() {
  const [filters, setFilters] = useState<RetreatFilters>(defaultFilters);
  const upcoming = useMemo(() => listUpcomingRetreats(), []);
  const filtered = useMemo(() => filterRetreats(upcoming, filters), [upcoming, filters]);

  return (
    <div className="pb-16">
      <header className="mb-8 space-y-4">
        <Link
          href="/logistique"
          className="inline-flex items-center gap-2 text-xs font-medium text-padma-night/60 hover:text-padma-lavender dark:text-padma-cream/60"
        >
          ← Ops &amp; logistique
        </Link>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <p className="font-display text-xs uppercase tracking-[0.28em] text-padma-pearl dark:text-padma-lavender/90">
            Réserver une immersion
          </p>
          <h1 className="mt-2 font-cinzel text-3xl font-normal tracking-wide text-padma-night dark:text-padma-cream">
            Retraites Serey Padma
          </h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-padma-night/78 dark:text-padma-cream/82">
            Chaque voyage mêle Reiki, oracle et présence au monde. Choisis ta durée, ta terre d’accueil et l’énergie qui t’appelle — les
            places sont vivantes et limitées.
          </p>
        </motion.div>
        <HyperfocusToolbar />
      </header>

      <RetreatFiltersBar value={filters} onChange={setFilters} className="mb-8" />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-padma-pearl/50 bg-padma-cream/30 px-6 py-14 text-center dark:bg-padma-night/40">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-padma-champagne/80" aria-hidden />
          <p className="font-cinzel text-padma-night dark:text-padma-cream">Aucune retraite ne correspond à ces filtres.</p>
          <p className="mt-2 text-sm text-padma-night/65 dark:text-padma-cream/70">Élargis la durée ou l’énergie — ou reviens bientôt.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-8">
          {filtered.map((r, i) => (
            <li key={r.id}>
              <RetreatCard retreat={r} index={i} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-padma-night/50 dark:text-padma-cream/55">
        <CalendarHeart className="h-4 w-4" aria-hidden />
        Catalogue disponible hors ligne — synchronisation paiement lorsque Stripe est configuré.
      </p>
    </div>
  );
}
