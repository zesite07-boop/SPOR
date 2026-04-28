"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/serey_padma_lotus.png"
        alt="Serey Padma by Céline"
        width={52}
        height={52}
        className={cn("w-auto rounded-xl object-contain", compact ? "h-[52px]" : "h-[56px]")}
        priority={compact}
      />
      <div className="min-w-0">
        <p className={cn("font-cinzel tracking-wide text-[#1a1625]", compact ? "text-sm" : "text-base")}>
          Serey Padma by Céline
        </p>
        <p className={cn("font-sans font-light text-[#7c6faf]", compact ? "text-[0.68rem]" : "text-sm")}>
          Reiki · Oracle · Retreats
        </p>
      </div>
    </div>
  );
}
