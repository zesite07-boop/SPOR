"use client";

import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import type { LogisticsParticipant } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function ParticipantCard({
  p,
  hyperfocus,
  onRoomChange,
  onTransferChange,
}: {
  p: LogisticsParticipant;
  hyperfocus?: boolean;
  onRoomChange: (room: string) => void;
  onTransferChange: (t: string) => void;
}) {
  return (
    <motion.div
      layout
      className={cn(
        "rounded-2xl border border-padma-champagne/35 bg-white/80 p-4 dark:border-padma-lavender/25 dark:bg-padma-night/50",
        hyperfocus && "p-3"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-padma-lavender/20 dark:bg-padma-lavender/15">
          <User className="h-5 w-5 text-padma-lavender" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-cinzel text-base text-padma-night dark:text-padma-cream">
            {p.name}{" "}
            <span className="font-sans text-xs font-normal text-padma-night/55 dark:text-padma-cream/60">
              ×{p.partySize}
            </span>
          </p>
          {p.birthDate && (
            <p className="mt-1 text-xs text-padma-night/60 dark:text-padma-cream/65">Naissance · {p.birthDate}</p>
          )}
          {p.allergies && (
            <p className="mt-2 rounded-lg bg-red-50/90 px-2 py-1 text-xs text-red-900/90 dark:bg-red-950/40 dark:text-red-100/95">
              Allergies : {p.allergies}
            </p>
          )}
          {p.intentions && (
            <p className="mt-2 flex gap-2 text-xs leading-relaxed text-padma-night/75 dark:text-padma-cream/78">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-padma-champagne" aria-hidden />
              {p.intentions}
            </p>
          )}
          {p.oracleNote && !p.intentions && (
            <p className="mt-2 text-xs italic text-padma-night/55 dark:text-padma-cream/58">{p.oracleNote}</p>
          )}
        </div>
      </div>
      <div className={cn("mt-4 grid gap-3 sm:grid-cols-2", hyperfocus && "mt-3 gap-2")}>
        <label className="block text-[0.65rem] uppercase tracking-wide text-padma-night/50 dark:text-padma-cream/55">
          Chambre
          <input
            value={p.roomLabel ?? ""}
            onChange={(e) => onRoomChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-padma-champagne/40 bg-white px-2 py-1.5 text-sm dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
          />
        </label>
        <label className="block text-[0.65rem] uppercase tracking-wide text-padma-night/50 dark:text-padma-cream/55">
          Transfert
          <input
            value={p.transferStatus ?? ""}
            onChange={(e) => onTransferChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-padma-champagne/40 bg-white px-2 py-1.5 text-sm dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
          />
        </label>
      </div>
    </motion.div>
  );
}
