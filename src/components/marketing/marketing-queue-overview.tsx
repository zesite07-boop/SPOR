"use client";

import type { MarketingQueueItem } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function MarketingQueueOverview({
  items,
  onToggle,
  hyperfocus,
}: {
  items: MarketingQueueItem[];
  onToggle: (id: string, done: boolean) => void;
  hyperfocus?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-padma-champagne/22 bg-white/75 shadow-soft dark:border-padma-lavender/18 dark:bg-padma-night/45",
        hyperfocus && "rounded-xl"
      )}
    >
      <div className="border-b border-padma-champagne/15 px-4 py-3 dark:border-padma-lavender/12">
        <p className="font-cinzel text-sm tracking-wide text-padma-night dark:text-padma-cream">À poster</p>
        <p className="text-[0.65rem] text-padma-night/55 dark:text-padma-cream/58">Checklist locale — coches synchronisées Dexie</p>
      </div>
      <ul className="divide-y divide-padma-champagne/12 dark:divide-padma-lavender/10">
        {items.map((it) => (
          <li key={it.id}>
            <label className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-padma-champagne/8 dark:hover:bg-padma-lavender/8">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-padma-champagne/35 bg-white dark:border-padma-lavender/30 dark:bg-padma-night/60">
                <input
                  type="checkbox"
                  checked={it.done}
                  className="sr-only"
                  onChange={() => onToggle(it.id, !it.done)}
                />
                {it.done ? (
                  <Check className="h-4 w-4 text-padma-pearl dark:text-padma-lavender" aria-hidden />
                ) : (
                  <span className="block h-3.5 w-3.5 rounded-sm border border-padma-night/25 dark:border-padma-cream/35" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-sm text-padma-night dark:text-padma-cream",
                    it.done && "text-padma-night/45 line-through dark:text-padma-cream/45"
                  )}
                >
                  {it.label}
                </span>
                {it.suggestedDate ? (
                  <span className="mt-0.5 block text-[0.65rem] text-padma-pearl dark:text-padma-lavender/75">
                    Suggestion · {it.suggestedDate}
                  </span>
                ) : null}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
