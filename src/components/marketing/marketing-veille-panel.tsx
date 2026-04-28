"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function MarketingVeillePanel({
  bullets,
  hyperfocus,
}: {
  bullets: { tag: string; text: string }[];
  hyperfocus?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-padma-champagne/22 bg-gradient-to-br from-white/90 to-padma-lavender/12 shadow-soft",
        hyperfocus && "rounded-xl"
      )}
    >
      <div className="flex items-center gap-2 border-b border-padma-champagne/15 px-4 py-3">
        <TrendingUp className="h-5 w-5 text-padma-champagne" aria-hidden />
        <div>
          <p className="font-cinzel text-sm tracking-wide text-padma-night">Veille douce</p>
          <p className="text-[0.65rem] text-padma-night/55">
            Bien-être · astrologie · numérologie — rotation locale sans réseau
          </p>
        </div>
      </div>
      <ul className="space-y-3 p-4">
        {bullets.map((b, i) => (
          <motion.li
            key={`${b.tag}-${i}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl border border-padma-champagne/12 bg-white/60 px-3 py-2.5"
          >
            <span className="inline-flex h-auto max-w-full whitespace-normal break-words font-display text-[0.6rem] uppercase tracking-[0.2em] text-padma-pearl">
              {b.tag}
            </span>
            <p className="mt-1 text-sm leading-relaxed text-padma-night/88">{b.text}</p>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
