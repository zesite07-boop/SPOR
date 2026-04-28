"use client";

import type { RetreatFilters } from "@/lib/reservation/filter-retreats";
import { DESTINATION_OPTIONS, DURATION_OPTIONS, ENERGY_OPTIONS } from "@/lib/reservation/catalog";
import { cn } from "@/lib/utils";

export function RetreatFiltersBar({
  value,
  onChange,
  className,
}: {
  value: RetreatFilters;
  onChange: (next: RetreatFilters) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-padma-pearl/35 bg-white/70 p-4",
        className
      )}
    >
      <p className="font-cinzel text-sm tracking-wide text-padma-night">Affiner la liste</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-xs uppercase tracking-wide text-padma-night/60">
          Durée
          <select
            value={value.duration}
            onChange={(e) =>
              onChange({
                ...value,
                duration: e.target.value === "all" ? "all" : (Number(e.target.value) as 3 | 5 | 7),
              })
            }
            className="rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm font-normal normal-case text-padma-night"
          >
            {DURATION_OPTIONS.map((o) => (
              <option key={String(o.days)} value={o.days === "all" ? "all" : o.days}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs uppercase tracking-wide text-padma-night/60">
          Destination
          <select
            value={value.destination}
            onChange={(e) =>
              onChange({
                ...value,
                destination: e.target.value as RetreatFilters["destination"],
              })
            }
            className="rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm font-normal normal-case text-padma-night"
          >
            {DESTINATION_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs uppercase tracking-wide text-padma-night/60">
          Énergie du moment
          <select
            value={value.energy}
            onChange={(e) =>
              onChange({
                ...value,
                energy: e.target.value as RetreatFilters["energy"],
              })
            }
            className="rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm font-normal normal-case text-padma-night"
          >
            {ENERGY_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
