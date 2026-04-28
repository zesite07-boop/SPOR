"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NAV_TABS } from "@/components/layout/nav-tabs";
import { useUiStore } from "@/stores/ui-store";

export function BottomNav() {
  const pathname = usePathname();
  const points = useUiStore((s) => s.energyPoints);
  const badges = useUiStore((s) => s.badges);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-3xl border border-oasis-champagne/25 bg-white/90 pb-safe shadow-soft backdrop-blur-xl dark:border-oasis-lavender/20 dark:bg-oasis-night/92 print:hidden",
        "safe-area-pb"
      )}
      aria-label="Navigation principale Serey Padma by Celine"
    >
      <div className="px-2 pt-1 text-center">
        <span className="inline-flex items-center gap-1 rounded-full border border-padma-champagne/30 bg-white/70 px-2 py-0.5 text-[0.62rem] text-padma-night/75 dark:border-padma-lavender/30 dark:bg-padma-night/65 dark:text-padma-cream/80">
          Energie {points} · Badges {badges.length}
        </span>
      </div>
      <ul className="flex items-stretch justify-between gap-0.5 px-1 py-2 sm:px-2">
        {NAV_TABS.map(({ href, label, shortLabel, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                prefetch
                className={cn(
                  "touch-min relative flex touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium tracking-wide transition-all duration-300 active:scale-[0.97] sm:text-[11px]",
                  active
                    ? "text-oasis-reiki dark:text-oasis-champagne"
                    : "text-oasis-night/55 hover:text-oasis-night dark:text-oasis-cream/55 dark:hover:text-oasis-cream"
                )}
                title={`Aller vers ${label} (Alt+${shortLabel})`}
              >
                {active && (
                  <motion.span
                    layoutId="tab-glow"
                    className="absolute inset-x-1.5 -bottom-1 h-9 rounded-full bg-gradient-to-t from-oasis-champagne/25 to-transparent dark:from-oasis-lavender/15"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className={cn("relative z-10 h-5 w-5", active && "drop-shadow-[0_0_8px_rgba(212,175,136,0.55)]")} aria-hidden />
                <span className="relative z-10">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
