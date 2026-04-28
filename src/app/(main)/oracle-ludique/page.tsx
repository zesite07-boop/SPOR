"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wind, Palette, BrainCircuit } from "lucide-react";
import { HyperfocusToolbar } from "@/components/layout/hyperfocus-toolbar";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { MAJOR_ARCANA } from "@/lib/oracle/tarot-major";

const PADMA_COLORS = ["#D4AF88", "#C5B4D4", "#A8B4C8", "#4A7043", "#F8F4ED"] as const;

const MANDALA_PATHS = [
  "M140 50 C180 80 180 140 140 170 C100 140 100 80 140 50 Z",
  "M140 110 C200 120 220 180 180 230 C150 210 130 170 140 110 Z",
  "M140 110 C80 120 60 180 100 230 C130 210 150 170 140 110 Z",
  "M140 170 C190 210 180 280 140 310 C100 280 90 210 140 170 Z",
  "M70 145 C95 135 120 150 120 180 C95 190 70 175 70 145 Z",
  "M210 145 C185 135 160 150 160 180 C185 190 210 175 210 145 Z",
] as const;

type BreathMode = "coherence" | "478";

function shuffle<T>(arr: T[]): T[] {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

export default function OracleLudiquePage() {
  const hyperfocus = useUiStore((s) => s.hyperfocus);
  const [selectedColor, setSelectedColor] = useState<string>(PADMA_COLORS[0]);
  const [fills, setFills] = useState<string[]>(() => Array.from({ length: MANDALA_PATHS.length }, () => "#FFFFFF"));

  const [breathMode, setBreathMode] = useState<BreathMode>("coherence");
  const [running, setRunning] = useState(false);
  const [phaseStart, setPhaseStart] = useState(Date.now());
  const [phaseIdx, setPhaseIdx] = useState(0);

  const [memoryCards, setMemoryCards] = useState(() => {
    const picked = shuffle(MAJOR_ARCANA).slice(0, 6).flatMap((c) => [c.id, c.id]);
    return shuffle(picked).map((id, idx) => ({ uid: `${id}-${idx}`, id, matched: false, open: false }));
  });
  const [turnBuffer, setTurnBuffer] = useState<string[]>([]);

  const sequence = breathMode === "coherence"
    ? [
        { label: "Inspire", ms: 5000 },
        { label: "Expire", ms: 5000 },
      ]
    : [
        { label: "Inspire", ms: 4000 },
        { label: "Retiens", ms: 7000 },
        { label: "Expire", ms: 8000 },
      ];

  const activePhase = sequence[phaseIdx]!;
  const [nowMs, setNowMs] = useState(Date.now());
  const phaseProgress = Math.min(1, (nowMs - phaseStart) / activePhase.ms);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      if (now - phaseStart >= activePhase.ms) {
        setPhaseStart(now);
        setPhaseIdx((p) => (p + 1) % sequence.length);
      }
    }, 120);
    return () => window.clearInterval(t);
  }, [running, phaseStart, activePhase.ms, sequence.length]);

  const memoryWon = useMemo(() => memoryCards.every((c) => c.matched), [memoryCards]);

  function paint(i: number) {
    setFills((prev) => prev.map((v, idx) => (idx === i ? selectedColor : v)));
  }

  function resetMandala() {
    setFills(Array.from({ length: MANDALA_PATHS.length }, () => "#FFFFFF"));
  }

  function resetMemory() {
    const picked = shuffle(MAJOR_ARCANA).slice(0, 6).flatMap((c) => [c.id, c.id]);
    setMemoryCards(shuffle(picked).map((id, idx) => ({ uid: `${id}-${idx}`, id, matched: false, open: false })));
    setTurnBuffer([]);
  }

  function flip(uid: string) {
    const card = memoryCards.find((c) => c.uid === uid);
    if (!card || card.matched || card.open || turnBuffer.length >= 2) return;
    const nextBuffer = [...turnBuffer, uid];
    setTurnBuffer(nextBuffer);
    setMemoryCards((prev) => prev.map((c) => (c.uid === uid ? { ...c, open: true } : c)));

    if (nextBuffer.length === 2) {
      const [a, b] = nextBuffer;
      const ca = memoryCards.find((c) => c.uid === a);
      const cb = memoryCards.find((c) => c.uid === b);
      const match = !!ca && !!cb && ca.id === cb.id;
      window.setTimeout(() => {
        setMemoryCards((prev) =>
          prev.map((c) =>
            c.uid === a || c.uid === b
              ? { ...c, matched: match ? true : c.matched, open: match ? true : false }
              : c
          )
        );
        setTurnBuffer([]);
      }, 520);
    }
  }

  return (
    <section className={cn("space-y-6 pb-8", hyperfocus && "space-y-4")}>
      <header className="space-y-2">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-oasis-reiki dark:text-oasis-champagne">Module 5</p>
        <h1 className="font-cinzel text-2xl font-normal tracking-wide text-oasis-night dark:text-oasis-cream">Espace ludique</h1>
        <p className="text-sm leading-relaxed text-oasis-night/75 dark:text-oasis-cream/80">
          Jeux ancrants 100 % offline : mandala colorable, respiration guidee et memoire tarot pour garder l&apos;elan sans surcharge.
        </p>
        <HyperfocusToolbar />
      </header>

      <Card className="border-oasis-champagne/40 bg-gradient-to-br from-white/90 to-oasis-champagne/10 dark:from-oasis-night/70 dark:to-oasis-reiki/25">
        <CardHeader>
          <Palette className="mb-1 h-6 w-6 text-oasis-champagne" aria-hidden />
          <CardTitle>Mandala interactif colorable</CardTitle>
          <CardDescription>Choisis une teinte Padma, puis touche les formes pour colorer ton mandala.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PADMA_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(c)}
                className={cn(
                  "touch-min h-9 w-9 rounded-full border-2 transition",
                  selectedColor === c ? "border-padma-night dark:border-padma-cream" : "border-white/70 dark:border-padma-night/70"
                )}
                style={{ backgroundColor: c }}
                aria-label={`Choisir ${c}`}
              />
            ))}
            <Button type="button" size="sm" variant="secondary" className="rounded-full" onClick={resetMandala}>
              Reinitialiser
            </Button>
          </div>
          <svg viewBox="0 0 280 360" className="mx-auto w-full max-w-xs rounded-2xl bg-white/65 p-2 dark:bg-padma-night/40">
            {MANDALA_PATHS.map((d, i) => (
              <path
                key={d}
                d={d}
                fill={fills[i]}
                stroke="#C5B4D4"
                strokeWidth="2"
                className="cursor-pointer transition-opacity hover:opacity-85"
                onClick={() => paint(i)}
              />
            ))}
          </svg>
        </CardContent>
      </Card>

      <Card className="border-oasis-champagne/35 bg-gradient-to-br from-white/90 to-padma-lavender/12 dark:from-oasis-night/70 dark:to-padma-lavender/15">
        <CardHeader>
          <Wind className="mb-1 h-6 w-6 text-padma-lavender" aria-hidden />
          <CardTitle>Respiration guidee</CardTitle>
          <CardDescription>Modes 4-7-8 ou coherence cardiaque (5s/5s), avec animation visuelle.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant={breathMode === "coherence" ? "oracle" : "secondary"} onClick={() => setBreathMode("coherence")}>
              Coherence 5/5
            </Button>
            <Button type="button" size="sm" variant={breathMode === "478" ? "oracle" : "secondary"} onClick={() => setBreathMode("478")}>
              4-7-8
            </Button>
            <Button type="button" size="sm" variant={running ? "secondary" : "oracle"} onClick={() => setRunning((s) => !s)}>
              {running ? "Pause" : "Demarrer"}
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="h-24 w-24 rounded-full bg-gradient-to-br from-padma-champagne/45 to-padma-lavender/35 transition-transform duration-300"
              style={{ transform: `scale(${0.78 + phaseProgress * 0.42})` }}
            />
            <div className="text-sm">
              <p className="font-cinzel text-base text-padma-night dark:text-padma-cream">{activePhase.label}</p>
              <p className="text-padma-night/70 dark:text-padma-cream/75">
                {Math.max(0, Math.ceil((activePhase.ms - (Date.now() - phaseStart)) / 1000))} sec
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-oasis-champagne/35 bg-gradient-to-br from-white/90 to-oasis-reiki/10 dark:from-oasis-night/70 dark:to-oasis-reiki/20">
        <CardHeader>
          <BrainCircuit className="mb-1 h-6 w-6 text-oasis-reiki" aria-hidden />
          <CardTitle>Memoire des arcanes majeurs</CardTitle>
          <CardDescription>Retourne les cartes et retrouve les paires. Tout se joue en local, sans API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {memoryCards.map((c) => {
              const open = c.open || c.matched;
              return (
                <button
                  key={c.uid}
                  type="button"
                  onClick={() => flip(c.uid)}
                  className={cn(
                    "touch-min min-h-16 rounded-xl border px-2 py-2 text-center text-xs transition",
                    open
                      ? "border-padma-lavender/45 bg-white/85 text-padma-night dark:border-padma-lavender/35 dark:bg-padma-night/50 dark:text-padma-cream"
                      : "border-padma-champagne/30 bg-padma-cream/55 text-padma-night/65 dark:border-padma-lavender/20 dark:bg-padma-night/35 dark:text-padma-cream/70"
                  )}
                >
                  {open ? MAJOR_ARCANA[c.id]?.name ?? "Arcane" : "✦"}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={resetMemory}>
              Relancer une partie
            </Button>
            {memoryWon && (
              <span className="rounded-full border border-padma-champagne/35 bg-white/70 px-3 py-1 text-xs text-padma-night dark:border-padma-lavender/30 dark:bg-padma-night/55 dark:text-padma-cream">
                Bravo, toutes les paires sont reunies ✦
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-oasis-night/60 dark:text-oasis-cream/65">
        Ces trois jeux fonctionnent hors ligne et ne necessitent ni API ni store externe.
      </p>
    </section>
  );
}
