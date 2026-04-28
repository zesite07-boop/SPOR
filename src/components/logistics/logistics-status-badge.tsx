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
        status === "preparation" &&
          "border-padma-pearl/50 bg-padma-pearl/15 text-padma-night/80",
        status === "ready" &&
          "border-padma-champagne/55 bg-padma-champagne/20 text-padma-night",
        status === "in_progress" &&
          "border-padma-lavender/55 bg-padma-lavender/20 text-padma-night",
        status === "completed" &&
          "border-padma-pearl/40 bg-white/60 text-padma-night/72",
        className
      )}
    >
      {LABELS[status]}
    </span>
  );
}
