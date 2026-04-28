"use client";

import type { MarketingScenario } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function TemplateCard({
  title,
  hint,
  active,
  onSelect,
}: {
  title: string;
  hint: string;
  active?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border px-4 py-3 text-left transition-all duration-300",
        active
          ? "border-padma-lavender/50 bg-gradient-to-br from-padma-champagne/25 to-padma-lavender/15 shadow-soft dark:from-padma-champagne/12 dark:to-padma-lavender/18"
          : "border-padma-champagne/20 bg-white/70 hover:border-padma-lavender/35 dark:border-padma-lavender/15 dark:bg-padma-night/45"
      )}
    >
      <p className="font-cinzel text-sm tracking-wide text-padma-night dark:text-padma-cream">{title}</p>
      <p className="mt-1 text-[0.7rem] leading-snug text-padma-night/62 dark:text-padma-cream/65">{hint}</p>
    </button>
  );
}

export function ScenarioQuickGrid({
  scenarios,
  selected,
  onSelect,
}: {
  scenarios: { id: MarketingScenario; label: string; hint: string }[];
  selected: MarketingScenario;
  onSelect: (id: MarketingScenario) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {scenarios.map((s) => (
        <TemplateCard
          key={s.id}
          title={s.label}
          hint={s.hint}
          active={selected === s.id}
          onSelect={() => onSelect(s.id)}
        />
      ))}
    </div>
  );
}
