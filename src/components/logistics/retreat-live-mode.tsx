"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { RetreatDefinition } from "@/lib/reservation/catalog";
import { db, type LogisticsTask } from "@/lib/db/schema";
import { getMajorById } from "@/lib/oracle/tarot-major";
import { Button } from "@/components/ui/button";

function dayIndexForRetreat(retreat: RetreatDefinition): number {
  const start = new Date(retreat.startDate + "T12:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - start.getTime()) / 86400000));
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function RetreatLiveMode({ retreat }: { retreat: RetreatDefinition }) {
  const todayIdx = useMemo(() => dayIndexForRetreat(retreat), [retreat]);
  const [blocks, setBlocks] = useState<LogisticsTask[]>([]);
  const [notes, setNotes] = useState("");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const morningArcana = useMemo(() => {
    const seed = new Date().getDate() + todayIdx * 13 + retreat.id.length;
    return getMajorById(seed % 22);
  }, [retreat.id, todayIdx]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!db) return;
      await db.events.put({
        id: "retreat-mode-active",
        title: retreat.id,
        startAt: Date.now(),
        updatedAt: Date.now(),
      });
      const [tasks, noteRow, timerRow] = await Promise.all([
        db.logisticsTasks.where({ retreatId: retreat.id, section: "planning", dayIndex: todayIdx }).sortBy("sortOrder"),
        db.events.get(`retreat-mode-note-${retreat.id}-${todayIdx}`),
        db.events.get(`retreat-mode-timer-${retreat.id}-${todayIdx}`),
      ]);
      if (cancelled) return;
      setBlocks(tasks);
      setNotes(noteRow?.cosmicNote ?? "");
      setElapsed(Number(timerRow?.cosmicNote ?? "0") || 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [retreat.id, todayIdx]);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setElapsed((v) => v + 1000), 1000);
    return () => window.clearInterval(t);
  }, [running]);

  async function saveNote(v: string) {
    if (!db) return;
    await db.events.put({
      id: `retreat-mode-note-${retreat.id}-${todayIdx}`,
      title: "Retreat live notes",
      startAt: Date.now(),
      cosmicNote: v,
      updatedAt: Date.now(),
    });
  }

  async function persistTimer(v: number) {
    if (!db) return;
    await db.events.put({
      id: `retreat-mode-timer-${retreat.id}-${todayIdx}`,
      title: "Retreat live timer",
      startAt: Date.now(),
      cosmicNote: String(v),
      updatedAt: Date.now(),
    });
  }

  async function quitMode() {
    if (!db) return;
    await db.events.delete("retreat-mode-active");
  }

  return (
    <main className="min-h-dvh bg-padma-cream px-4 py-4 text-padma-night dark:bg-padma-night dark:text-padma-cream">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <header className="rounded-3xl border border-padma-champagne/35 bg-white/90 p-5 dark:bg-padma-night/70">
          <p className="text-xs uppercase tracking-[0.2em] text-padma-night/60 dark:text-padma-cream/65">Mode retraite actif</p>
          <h1 className="mt-2 font-cinzel text-3xl">{retreat.title}</h1>
          <p className="mt-1 text-sm">{retreat.destinationLabel}</p>
          <Button asChild className="mt-4 w-full rounded-2xl font-cinzel" onClick={() => void quitMode()}>
            <Link href={`/logistique/${retreat.id}`}>Quitter le mode retraite</Link>
          </Button>
        </header>

        <section className="rounded-3xl border border-padma-champagne/35 bg-white/90 p-5 dark:bg-padma-night/70">
          <h2 className="font-cinzel text-2xl">Programme du jour</h2>
          <ul className="mt-3 space-y-2">
            {blocks.map((b) => (
              <li key={b.id} className="rounded-2xl border border-padma-lavender/30 bg-white/80 p-3 text-base dark:bg-padma-night/60">
                <span className="mr-2 font-medium">{b.slot ?? "Bloc"}</span>
                {b.label}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-padma-champagne/35 bg-white/90 p-5 dark:bg-padma-night/70">
          <h2 className="font-cinzel text-2xl">Tirage du matin</h2>
          <p className="mt-2 text-lg">{morningArcana.name}</p>
          <p className="text-sm text-padma-night/80 dark:text-padma-cream/82">{morningArcana.gentle}</p>
        </section>

        <section className="rounded-3xl border border-padma-champagne/35 bg-white/90 p-5 dark:bg-padma-night/70">
          <h2 className="font-cinzel text-2xl">Chronometre de session</h2>
          <p className="mt-2 text-4xl font-semibold">{fmt(elapsed)}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Button type="button" className="touch-min rounded-2xl" onClick={() => setRunning((v) => !v)}>
              {running ? <Pause className="h-5 w-5" aria-hidden /> : <Play className="h-5 w-5" aria-hidden />}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="touch-min rounded-2xl"
              onClick={() => {
                setElapsed(0);
                void persistTimer(0);
              }}
            >
              <RotateCcw className="h-5 w-5" aria-hidden />
            </Button>
            <Button type="button" variant="secondary" className="touch-min rounded-2xl" onClick={() => void persistTimer(elapsed)}>
              Sauver
            </Button>
          </div>
        </section>

        <section className="rounded-3xl border border-padma-champagne/35 bg-white/90 p-5 dark:bg-padma-night/70">
          <h2 className="font-cinzel text-2xl">Notes rapides</h2>
          <textarea
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => void saveNote(notes)}
            className="mt-3 w-full rounded-2xl border border-padma-champagne/35 bg-white/85 p-3 text-base dark:bg-padma-night/60"
            placeholder="Intentions, observations, ajustements..."
          />
        </section>
      </div>
    </main>
  );
}
