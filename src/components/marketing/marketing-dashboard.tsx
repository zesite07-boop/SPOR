"use client";

import { useCallback, useEffect, useState } from "react";
import { HyperfocusToolbar } from "@/components/layout/hyperfocus-toolbar";
import { GeneratorForm } from "@/components/marketing/generator-form";
import { MarketingQueueOverview } from "@/components/marketing/marketing-queue-overview";
import { MarketingVeillePanel } from "@/components/marketing/marketing-veille-panel";
import { PreviewPanel } from "@/components/marketing/preview-panel";
import type { MarketingFormat, MarketingQueueItem, MarketingScenario } from "@/lib/db/schema";
import { buildMarketingContext } from "@/lib/marketing/context";
import { generateMarketingCopy, type GeneratedMarketing } from "@/lib/marketing/generate-local";
import {
  loadMarketingPrefs,
  loadMarketingQueue,
  saveMarketingPrefs,
  toggleQueueItemDone,
} from "@/lib/marketing/queue-actions";
import { getVeilleBullets } from "@/lib/marketing/veille";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export function MarketingDashboard() {
  const hyperfocus = useUiStore((s) => s.hyperfocus);
  const celebrate = useUiStore((s) => s.celebrate);
  const [format, setFormat] = useState<MarketingFormat>("feed_post");
  const [scenario, setScenario] = useState<MarketingScenario>("before_retreat");
  const [generated, setGenerated] = useState<GeneratedMarketing | null>(null);
  const [generating, setGenerating] = useState(false);
  const [queue, setQueue] = useState<MarketingQueueItem[]>([]);
  const [veille] = useState(() => getVeilleBullets());

  const refreshQueue = useCallback(async () => {
    setQueue(await loadMarketingQueue());
  }, []);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const prefs = await loadMarketingPrefs();
      if (!alive) return;
      setFormat(prefs.lastFormat);
      setScenario(prefs.lastScenario);
      await refreshQueue();
      const ctx = await buildMarketingContext();
      setGenerating(true);
      try {
        const next = generateMarketingCopy(prefs.lastFormat, prefs.lastScenario, ctx);
        if (alive) setGenerated(next);
      } finally {
        if (alive) setGenerating(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [refreshQueue]);

  const runGenerate = useCallback(async () => {
    setGenerating(true);
    try {
      const ctx = await buildMarketingContext();
      const next = generateMarketingCopy(format, scenario, ctx);
      setGenerated(next);
      await saveMarketingPrefs({ lastFormat: format, lastScenario: scenario });
      celebrate("Ton message est prêt à être offert ✦");
    } finally {
      setGenerating(false);
    }
  }, [format, scenario, celebrate]);

  const handleCopy = useCallback(async () => {
    if (!generated) return;
    const text = `${generated.title}\n\n${generated.body}\n\n${generated.hashtags.join(" ")}`;
    await navigator.clipboard.writeText(text);
    celebrate("Copié — colle où ton cœur rayonne");
  }, [generated, celebrate]);

  const handleToggle = useCallback(
    async (id: string, done: boolean) => {
      await toggleQueueItemDone(id, done);
      await refreshQueue();
    },
    [refreshQueue]
  );

  return (
    <div className={cn("pb-24", hyperfocus && "space-y-6")}>
      <header className={cn("mb-8 space-y-4", hyperfocus && "mb-5 space-y-3")}>
        <p className="font-display text-xs uppercase tracking-[0.22em] text-padma-pearl dark:text-padma-lavender/90">
          Module 4 · rayonner
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-cinzel text-3xl font-normal tracking-wide text-padma-night dark:text-padma-cream">
              Studio marketing
            </h1>
            <p className="mt-2 max-w-prose text-sm text-padma-night/78 dark:text-padma-cream/82">
              Idees a publier, veille inspirante et generateur hors ligne - pour rayonner avec grace, regularite et clarte.
            </p>
          </div>
        </div>
        <HyperfocusToolbar />
      </header>

      <div className={cn("grid gap-6 lg:grid-cols-2", hyperfocus && "gap-4")}>
        <MarketingQueueOverview items={queue} onToggle={handleToggle} hyperfocus={hyperfocus} />
        <MarketingVeillePanel bullets={veille} hyperfocus={hyperfocus} />
      </div>

      <section className={cn("mt-10 space-y-6", hyperfocus && "mt-8 space-y-4")}>
        <h2 className="font-cinzel text-xl tracking-wide text-padma-night dark:text-padma-cream">Générateur</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <GeneratorForm
            format={format}
            scenario={scenario}
            onFormatChange={setFormat}
            onScenarioChange={setScenario}
            onGenerate={() => void runGenerate()}
            generating={generating}
            hyperfocus={hyperfocus}
          />
          <PreviewPanel generated={generated} onCopy={() => void handleCopy()} hyperfocus={hyperfocus} />
        </div>
      </section>

      <p className="mt-8 text-center text-[0.65rem] text-padma-night/48 dark:text-padma-cream/52">
        IA cloud optionnelle plus tard · ici, creation locale bienveillante et souveraine.
      </p>
    </div>
  );
}
