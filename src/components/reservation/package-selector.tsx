"use client";

import { motion } from "framer-motion";
import type { PackageDays, RetreatPackageDef } from "@/lib/reservation/catalog";
import { cn } from "@/lib/utils";

export function PackageSelector({
  packages,
  value,
  onChange,
}: {
  packages: RetreatPackageDef[];
  value: PackageDays;
  onChange: (d: PackageDays) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {packages.map((p, i) => {
        const active = value === p.days;
        return (
          <motion.button
            key={p.days}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onChange(p.days)}
            className={cn(
              "flex flex-col rounded-2xl border p-4 text-left transition",
              active
                ? "border-padma-champagne/70 bg-padma-champagne/15 ring-2 ring-padma-lavender/35"
                : "border-padma-pearl/35 bg-white/70 hover:border-padma-lavender/45"
            )}
          >
            <span className="font-cinzel text-lg text-padma-night">{p.days} jours</span>
            <span className="mt-1 text-xs text-padma-night/60">{p.label}</span>
            <span className="mt-3 font-display text-sm text-padma-night/85">
              {p.priceEuro} € <span className="text-xs font-normal text-padma-night/50">/ pers.</span>
            </span>
            <span className="mt-1 text-[0.65rem] text-padma-pearl">
              Acompte indicatif {p.depositEuro} € / pers.
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
