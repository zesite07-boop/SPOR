"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { HyperfocusToolbar } from "@/components/layout/hyperfocus-toolbar";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

export default function OracleLudiquePage() {
  const hyperfocus = useUiStore((s) => s.hyperfocus);

  return (
    <section className={cn("space-y-6 pb-8", hyperfocus && "space-y-4")}>
      <header className="space-y-2">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-oasis-reiki dark:text-oasis-champagne">Module 5</p>
        <h1 className="font-cinzel text-2xl font-normal tracking-wide text-oasis-night dark:text-oasis-cream">Espace ludique</h1>
        <p className="text-sm leading-relaxed text-oasis-night/75 dark:text-oasis-cream/80">
          Mandala Oracle personnalisable, simulateurs gamifies et respiration creative pour garder l&apos;elan sans surcharge.
        </p>
        <HyperfocusToolbar />
      </header>
      <Card className="border-oasis-champagne/40 bg-gradient-to-br from-white/90 to-oasis-champagne/10 dark:from-oasis-night/70 dark:to-oasis-reiki/25">
        <CardHeader>
          <Sparkles className="mb-1 h-6 w-6 text-oasis-champagne" aria-hidden />
          <CardTitle>Mandala Oracle vivant</CardTitle>
          <CardDescription>Widgets repositionnables (react-grid-layout) — à brancher au store Zustand.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-oasis-night/70 dark:text-oasis-cream/75">
            Points d’énergie, badges et streaks doux — animations Framer Motion déjà actives sur l’accueil.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
