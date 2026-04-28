"use client";

import type { MarketingFormat, MarketingScenario } from "@/lib/db/schema";
import { FORMAT_OPTIONS, SCENARIO_OPTIONS } from "@/lib/marketing/marketing-options";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function GeneratorForm({
  format,
  scenario,
  onFormatChange,
  onScenarioChange,
  onGenerate,
  generating,
  hyperfocus,
}: {
  format: MarketingFormat;
  scenario: MarketingScenario;
  onFormatChange: (f: MarketingFormat) => void;
  onScenarioChange: (s: MarketingScenario) => void;
  onGenerate: () => void;
  generating?: boolean;
  hyperfocus?: boolean;
}) {
  return (
    <div className={cn("space-y-6", hyperfocus && "space-y-4")}>
      <div>
        <p className="font-display text-[0.65rem] uppercase tracking-[0.2em] text-padma-pearl dark:text-padma-lavender/85">
          Format
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FORMAT_OPTIONS.map((f) => (
            <Button
              key={f.id}
              type="button"
              size="sm"
              variant={format === f.id ? "oracle" : "secondary"}
              className="rounded-full gap-1.5 text-xs"
              title={f.hint}
              onClick={() => onFormatChange(f.id)}
            >
              <Wand2 className="h-3.5 w-3.5" aria-hidden />
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="font-display text-[0.65rem] uppercase tracking-[0.2em] text-padma-pearl dark:text-padma-lavender/85">
          Scénario éditorial
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SCENARIO_OPTIONS.map((s) => (
            <Button
              key={s.id}
              type="button"
              size="sm"
              variant={scenario === s.id ? "oracle" : "ghost"}
              className={cn(
                "h-auto min-h-[2.75rem] w-full flex-col items-start rounded-xl px-3 py-2 text-left",
                scenario === s.id && "shadow-soft"
              )}
              onClick={() => onScenarioChange(s.id)}
            >
              <span className="w-full whitespace-normal break-words font-cinzel text-xs leading-tight">{s.label}</span>
              <span className="mt-0.5 w-full whitespace-normal break-words text-[0.65rem] font-normal leading-snug opacity-85">{s.hint}</span>
            </Button>
          ))}
        </div>
      </div>

      <Button
        type="button"
        variant="oracle"
        className="w-full gap-2 rounded-full font-cinzel sm:w-auto"
        disabled={generating}
        onClick={onGenerate}
      >
        <Sparkles className={cn("h-4 w-4", generating && "animate-pulse")} aria-hidden />
        {generating ? "Création en cours…" : "Générer & actualiser"}
      </Button>
    </div>
  );
}
