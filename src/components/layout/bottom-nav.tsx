"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NAV_TABS } from "@/components/layout/nav-tabs";
import { useUiStore } from "@/stores/ui-store";
import { isAdminSessionValid } from "@/lib/security/twofa";

export function BottomNav() {
  const pathname = usePathname();
  const points = useUiStore((s) => s.energyPoints);
  const badges = useUiStore((s) => s.badges);
  const [showSensitive, setShowSensitive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const valid = await isAdminSessionValid();
      if (!cancelled) setShowSensitive(valid);
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const tabs = showSensitive ? NAV_TABS : NAV_TABS.filter((t) => t.href !== "/rayonner" && t.href !== "/tresor");

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-3xl border border-[#e8e4f0] border-t-[1.5px] border-t-[#e8e4f0] bg-white/95 pb-safe shadow-[0_-8px_24px_rgba(61,54,80,0.12)] backdrop-blur-xl print:hidden",
        "safe-area-pb"
      )}
      aria-label="Navigation principale Serey Padma by Celine"
    >
      <div className="px-2 pt-1 text-center">
        <span className="inline-flex items-center gap-1 rounded-full border border-[#e8e4f0] bg-[#f8f7ff] px-2 py-0.5 text-[0.62rem] text-[#3d3650]">
          Energie {points} · Badges {badges.length}
        </span>
      </div>
      <ul className="flex items-stretch justify-between gap-0.5 px-1 py-2 sm:px-2">
        {tabs.map(({ href, label, shortLabel, Icon }) => {
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
                    ? "text-[#c9847a]"
                    : "text-[#7a7090] hover:text-[#1a1625]"
                )}
                title={`Aller vers ${label} (Alt+${shortLabel})`}
              >
                {active && (
                  <motion.span
                    layoutId="tab-glow"
                    className="absolute inset-x-1.5 -bottom-1 h-9 rounded-full bg-gradient-to-t from-oasis-champagne/25 to-transparent"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon
                  className={cn(
                    "relative z-10 h-5 w-5",
                    active && "drop-shadow-[0_0_8px_rgba(201,132,122,0.35)]"
                  )}
                  aria-hidden
                />
                <span className="relative z-10">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
