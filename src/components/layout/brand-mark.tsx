"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/serey_padma_lotus.png"
        alt="Serey Padma by Céline"
        width={48}
        height={48}
        className="h-12 w-auto rounded-xl object-contain"
        priority={compact}
      />
      <div className="min-w-0">
        <p className={cn("font-cinzel tracking-wide text-padma-night dark:text-padma-cream", compact ? "text-xs" : "text-sm")}>
          Serey Padma by Céline
        </p>
        <p className={cn("font-sans font-light text-padma-night/65 dark:text-padma-cream/70", compact ? "text-[0.62rem]" : "text-xs")}>
          Reiki · Oracle · Retreats
        </p>
      </div>
    </div>
  );
}
