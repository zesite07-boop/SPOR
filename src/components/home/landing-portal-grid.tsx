"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarHeart,
  ClipboardList,
  Compass,
  Flower2,
  type LucideIcon,
  MessagesSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isAdminSessionValid } from "@/lib/security/twofa";

type LandingModule = {
  href: string;
  label: string;
  Icon: LucideIcon;
  line: string;
  highlight?: boolean;
};

const MODULES: LandingModule[] = [
  {
    href: "/",
    label: "Accueil",
    Icon: CalendarHeart,
    line: "Calendrier doux & souffle du jour",
    highlight: true,
  },
  {
    href: "/logistique",
    label: "Opérations",
    Icon: ClipboardList,
    line: "Retraites, chambres, listes — offline",
  },
  {
    href: "/bien-etre",
    label: "Oracle",
    Icon: Flower2,
    line: "Tirages & interprétations lumineuses",
  },
  {
    href: "/rayonner",
    label: "Rayonner",
    Icon: MessagesSquare,
    line: "Studio marketing & templates",
  },
  {
    href: "/oracle-ludique",
    label: "Jeux",
    Icon: Sparkles,
    line: "Pause légère, même en excès de pensées",
  },
  {
    href: "/tresor",
    label: "Trésor",
    Icon: Compass,
    line: "Chiffres, scénarios & marges",
  },
];

export function LandingPortalGrid({ hyperfocus }: { hyperfocus?: boolean }) {
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
  }, []);

  const visibleModules = useMemo(
    () => (showSensitive ? MODULES : MODULES.filter((m) => m.href !== "/rayonner" && m.href !== "/tresor")),
    [showSensitive]
  );

  return (
    <section className={cn("space-y-5", hyperfocus && "space-y-4")}>
      <div className="text-center">
        <p className="font-display text-[0.65rem] uppercase tracking-[0.26em] text-padma-pearl">
          Portail
        </p>
        <h2 className="mt-2 font-cinzel text-xl tracking-wide text-padma-night">
          Six branches, une même intention
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-padma-night/72">
          Touche ce qui t’appelle — tout reste sur ton téléphone jusqu’à ce que tu choisisses le nuage.
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {visibleModules.map((m, i) => (
          <motion.li
            key={m.href}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
          >
            <Link
              href={m.href}
              className={cn(
                "padma-card group flex min-h-[88px] touch-manipulation items-start gap-3 p-4 transition-all duration-300 active:scale-[0.99]",
                m.highlight &&
                  "border-padma-lavender/35 bg-gradient-to-br from-white/95 to-padma-lavender/12"
              )}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-padma-champagne/18 text-padma-night transition-colors group-hover:bg-padma-champagne/28">
                <m.Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 text-left">
                <span className="font-cinzel text-sm tracking-wide text-padma-night">{m.label}</span>
                <span className="mt-1 block text-[0.8rem] leading-snug text-padma-night/68">
                  {m.line}
                </span>
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
      <p className="text-center text-[0.7rem] text-padma-night/48">
        Réservations vitrine :{" "}
        <Link href="/reservation" className="underline decoration-padma-champagne/50 underline-offset-4 hover:text-padma-lavender">
          découvrir les retraites
        </Link>
      </p>
    </section>
  );
}
