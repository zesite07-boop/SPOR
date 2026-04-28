"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, CalendarHeart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDailyEnergyMessage } from "@/lib/home/daily-energy-message";
import { db } from "@/lib/db/schema";
import { loadLocalProfile } from "@/lib/db/profile-local";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

function dayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function DailyEnergySection() {
  const hyperfocus = useUiStore((s) => s.hyperfocus);
  const [firstName, setFirstName] = useState<string | undefined>(undefined);
  const message = useMemo(() => getDailyEnergyMessage(new Date(), firstName), [firstName]);
  const dk = useMemo(() => dayKey(), []);
  const [note, setNote] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!db) return;
      try {
        const row = await db.events.get(`home-note-${dk}`);
        if (!cancelled && row?.cosmicNote) setNote(row.cosmicNote);
        const profile = await loadLocalProfile();
        const name = profile?.displayName?.trim();
        if (!cancelled && name) setFirstName(name.split(/\s+/)[0]);
      } catch {
        /* private mode */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dk]);

  async function persistNote(value: string) {
    if (!db) return;
    try {
      await db.events.put({
        id: `home-note-${dk}`,
        title: `Note ${dk}`,
        startAt: Date.now(),
        cosmicNote: value,
        updatedAt: Date.now(),
      });
    } catch {
      /* noop */
    }
  }

  return (
    <motion.section
      id="energy-journal"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.12 }}
      className={cn("space-y-4", hyperfocus && "space-y-3")}
    >
      <Card className="border-padma-champagne/40 bg-gradient-to-br from-padma-cream via-white to-padma-lavender/12">
        <CardHeader>
          <CardTitle className="font-cinzel text-xl font-normal tracking-[0.06em] text-padma-night">
            Mon énergie du jour
          </CardTitle>
          <CardDescription className="text-padma-night/65">
            Une lecture douce, inspiree et disponible hors ligne. Ton journal reste dans Dexie sur cet appareil.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="rounded-2xl border border-padma-pearl/35 bg-white/75 p-4 text-sm leading-[1.8] text-padma-night/85">
            {message}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button asChild variant="oracle" className="flex-1 rounded-2xl font-cinzel">
              <Link href="/oracle">
                <Sparkles className="h-4 w-4" aria-hidden />
                Ouvrir l&apos;Oracle
              </Link>
            </Button>
            <Button asChild variant="secondary" className="flex-1 rounded-2xl">
              <Link href="/logistique">
                <CalendarHeart className="h-4 w-4" aria-hidden />
                Voir les retraites
              </Link>
            </Button>
            <Button asChild variant="secondary" className="flex-1 rounded-2xl border-padma-lavender/40">
              <a href="#energy-journal-field">
                <BookOpen className="h-4 w-4" aria-hidden />
                Journal — écrire
              </a>
            </Button>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="energy-journal-field"
              className="text-xs font-medium uppercase tracking-wide text-padma-night/55"
            >
              Une ligne pour ton journal (sauvegardée localement)
            </label>
            <textarea
              id="energy-journal-field"
              rows={hyperfocus ? 2 : 3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => void persistNote(note)}
              placeholder="Mot, sensation, gratitude…"
              className="w-full rounded-2xl border border-padma-champagne/40 bg-white/85 px-4 py-3 text-sm text-padma-night shadow-inner outline-none transition focus:border-padma-lavender/60"
            />
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}
