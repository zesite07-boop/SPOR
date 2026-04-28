"use client";

import type { LogisticsRetreatStatus } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const LABELS: Record<LogisticsRetreatStatus, string> = {
  preparation: "Préparation",
  ready: "Prêt · vert",
  in_progress: "En cours",
  completed: "Complété",
};

export function LogisticsStatusBadge({
  status,
  className,
}: {
  status: LogisticsRetreatStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide",
        status === "preparation" && "border-padma-pearl/50 bg-padma-pearl/15 text-padma-night/75 dark:border-padma-pearl/35 dark:bg-padma-pearl/10 dark:text-padma-cream/78",
        status === "ready" && "border-padma-champagne/55 bg-padma-champagne/20 text-padma-night dark:border-padma-champagne/40 dark:bg-padma-champagne/15 dark:text-padma-cream",
        status === "in_progress" && "border-padma-lavender/55 bg-padma-lavender/20 text-padma-night dark:border-padma-lavender/40 dark:bg-padma-lavender/15 dark:text-padma-cream",
        status === "completed" && "border-padma-pearl/40 bg-white/60 text-padma-night/65 dark:border-padma-lavender/30 dark:bg-padma-night/50 dark:text-padma-cream/75",
        className
      )}
    >
      {LABELS[status]}
    </span>
  );
}
