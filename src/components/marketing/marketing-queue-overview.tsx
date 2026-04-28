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
        "rounded-2xl border border-padma-champagne/22 bg-white/75 shadow-soft",
        hyperfocus && "rounded-xl"
      )}
    >
      <div className="border-b border-padma-champagne/15 px-4 py-3">
        <p className="font-cinzel text-sm tracking-wide text-padma-night">À poster</p>
        <p className="text-[0.65rem] text-padma-night/55">Checklist locale — coches synchronisées Dexie</p>
      </div>
      <ul className="divide-y divide-padma-champagne/12">
        {items.map((it) => (
          <li key={it.id}>
            <label className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-padma-champagne/8">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-padma-champagne/35 bg-white">
                <input
                  type="checkbox"
                  checked={it.done}
                  className="sr-only"
                  onChange={() => onToggle(it.id, !it.done)}
                />
                {it.done ? (
                  <Check className="h-4 w-4 text-padma-pearl" aria-hidden />
                ) : (
                  <span className="block h-3.5 w-3.5 rounded-sm border border-padma-night/25" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-sm text-padma-night",
                    it.done && "text-padma-night/45 line-through"
                  )}
                >
                  {it.label}
                </span>
                {it.suggestedDate ? (
                  <span className="mt-0.5 block text-[0.65rem] text-padma-pearl">
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
