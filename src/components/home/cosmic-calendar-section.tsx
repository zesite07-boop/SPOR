"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarRange, Moon, Sparkles, Sun } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getMoonCalendarFromToday, getMoonDayInfo, isMajorMoonDay, type MoonPhaseKind } from "@/lib/cosmic/lunar";
import { suggestRetreatThemes } from "@/lib/cosmic/retreat-themes";
import { getMajorTransitHighlights } from "@/lib/cosmic/transits";
import { getSunSign } from "@/lib/cosmic/sun-sign";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const MOON_GLYPH: Record<MoonPhaseKind, string> = {
  new: "◯",
  waxing_crescent: "◔",
  first_quarter: "◑",
  waxing_gibbous: "◕",
  full: "●",
  waning_gibbous: "◕",
  last_quarter: "◐",
  waning_crescent: "◔",
};

function dayLabel(d: Date): string {
  return d.toLocaleDateString("fr-FR", { weekday: "narrow", day: "numeric" });
}

export function CosmicCalendarSection() {
  const hyperfocus = useUiStore((s) => s.hyperfocus);
  const today = useMemo(() => new Date(), []);
  const moonDays = useMemo(() => getMoonCalendarFromToday(30), []);
  const transits = useMemo(() => getMajorTransitHighlights(30), []);
  const sunToday = useMemo(() => getSunSign(today), [today]);
  const todayMoon = useMemo(() => getMoonDayInfo(today), [today]);
  const retreats = useMemo(
    () => suggestRetreatThemes(todayMoon.phase, sunToday),
    [todayMoon.phase, sunToday]
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("space-y-4", hyperfocus && "space-y-3")}
    >
      <Card className="relative overflow-hidden border-padma-champagne/35 bg-gradient-to-br from-white/95 via-padma-cream/90 to-padma-lavender/15 shadow-soft dark:from-padma-night/70 dark:via-padma-night/55 dark:to-padma-lavender/10">
        {!hyperfocus && (
          <div className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-padma-champagne/20 blur-3xl dark:bg-padma-lavender/15" aria-hidden />
        )}
        <CardHeader className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <CalendarRange className="h-5 w-5 text-padma-lavender dark:text-padma-champagne" aria-hidden />
            <CardTitle className="font-cinzel text-xl font-normal tracking-[0.06em] text-padma-night dark:text-padma-cream">
              Calendrier cosmique — 30 jours
            </CardTitle>
          </div>
          <CardDescription className="text-padma-night/65 dark:text-padma-cream/70">
            Phases lunaires locales · transits mis en avant · pistes de retraites selon le souffle du moment.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {/* Bande des 30 jours */}
          <div>
            <p className="mb-3 flex items-center gap-2 font-display text-xs uppercase tracking-[0.2em] text-padma-pearl dark:text-padma-lavender/90">
              <Moon className="h-4 w-4" aria-hidden />
              Lune
            </p>
            <div
              className={cn(
                "flex gap-2 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                hyperfocus && "gap-1.5"
              )}
            >
              {moonDays.map((m, i) => {
                const major = isMajorMoonDay(m);
                const isToday =
                  m.date.getDate() === today.getDate() &&
                  m.date.getMonth() === today.getMonth() &&
                  m.date.getFullYear() === today.getFullYear();
                return (
                  <motion.div
                    key={m.date.toISOString()}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.015, 0.35) }}
                    className={cn(
                      "flex min-w-[3.25rem] flex-col items-center rounded-2xl border px-2 py-2 text-center transition-colors",
                      isToday && "border-padma-champagne/70 bg-padma-champagne/15 ring-1 ring-padma-lavender/40 dark:bg-padma-lavender/15",
                      !isToday && "border-padma-pearl/35 bg-white/60 dark:border-padma-lavender/25 dark:bg-padma-night/40",
                      major === "new" && "ring-1 ring-padma-pearl/60",
                      major === "full" && "ring-1 ring-padma-champagne/70"
                    )}
                    title={m.labelFr}
                  >
                    <span className="text-[0.65rem] font-medium text-padma-night/55 dark:text-padma-cream/55">
                      {dayLabel(m.date)}
                    </span>
                    <span className="mt-1 text-lg text-padma-night/85 dark:text-padma-cream/90" aria-hidden>
                      {MOON_GLYPH[m.phase]}
                    </span>
                    <span className="mt-0.5 max-w-[3.25rem] truncate text-[0.55rem] leading-tight text-padma-night/45 dark:text-padma-cream/50">
                      {m.labelFr.replace("lune", "").trim()}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Transits */}
          <div className="rounded-2xl border border-padma-pearl/40 bg-white/55 p-4 dark:border-padma-lavender/25 dark:bg-padma-night/50">
            <p className="mb-3 flex items-center gap-2 font-display text-xs uppercase tracking-[0.2em] text-padma-pearl dark:text-padma-lavender/90">
              <Sun className="h-4 w-4" aria-hidden />
              Transits & seuils
            </p>
            <ul className="space-y-3">
              {transits.length === 0 && (
                <li className="text-sm text-padma-night/65 dark:text-padma-cream/70">
                  Les alignements majeurs apparaîtront ici (nouvelles / pleines lunes, ingress solaires, Mercure).
                </li>
              )}
              {transits.map((t) => (
                <li
                  key={`${t.isoDate}-${t.title}`}
                  className="rounded-xl border border-padma-champagne/25 bg-padma-cream/40 px-3 py-2 dark:border-padma-lavender/20 dark:bg-padma-night/35"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-padma-pearl dark:text-padma-lavender/85">
                    {t.dateLabel}
                  </p>
                  <p className="font-display text-sm text-padma-night dark:text-padma-cream">{t.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-padma-night/70 dark:text-padma-cream/75">{t.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Suggestions retraites */}
          <div className="rounded-2xl border border-padma-lavender/35 bg-gradient-to-br from-padma-lavender/12 to-transparent p-4 dark:from-padma-lavender/10">
            <p className="mb-2 flex items-center gap-2 font-cinzel text-sm tracking-wide text-padma-night dark:text-padma-cream">
              <Sparkles className="h-4 w-4 text-padma-champagne" aria-hidden />
              Thèmes de retraites suggérés
            </p>
            <ul className="space-y-2 text-sm leading-relaxed text-padma-night/80 dark:text-padma-cream/85">
              {retreats.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-padma-champagne/80" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}
