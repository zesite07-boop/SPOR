"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildOracleInterpretation,
  cardsWithRoles,
  drawSeededForDate,
  drawThreeCards,
} from "@/lib/oracle/daily-oracle";
import type { OracleDayDraw } from "@/lib/db/schema";
import { loadOracleHistory, loadTodayDraw, saveOracleDraw } from "@/lib/oracle/persist";
import { getMajorById } from "@/lib/oracle/tarot-major";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

function todayId(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type LegacyAudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

export function DailyOracleDraw() {
  const hyperfocus = useUiStore((s) => s.hyperfocus);
  const celebrate = useUiStore((s) => s.celebrate);
  const [cards, setCards] = useState<[number, number, number] | null>(null);
  const [text, setText] = useState("");
  const [history, setHistory] = useState<OracleDayDraw[]>([]);
  const [loading, setLoading] = useState(true);
  const [mixing, setMixing] = useState(false);
  const [revealedCount, setRevealedCount] = useState(3);

  const refreshHistory = useCallback(async () => {
    const h = await loadOracleHistory(7);
    setHistory(h);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const existing = await loadTodayDraw();
      const now = new Date();
      if (existing) {
        if (!cancelled) {
          setCards(existing.cardIds);
          setText(existing.interpretation);
        }
      } else {
        const seeded = drawSeededForDate(now);
        const interp = buildOracleInterpretation(now, seeded);
        await saveOracleDraw({
          id: todayId(),
          cardIds: seeded,
          interpretation: interp,
          drawnAt: Date.now(),
        });
        if (!cancelled) {
          setCards(seeded);
          setText(interp);
        }
      }
      await refreshHistory();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshHistory]);

  async function newDraw() {
    const now = new Date();
    const drawn = drawThreeCards();
    const interp = buildOracleInterpretation(now, drawn);
    setMixing(true);
    setRevealedCount(0);
    await new Promise((r) => setTimeout(r, 2000));
    setMixing(false);
    for (let i = 1; i <= 3; i++) {
      setRevealedCount(i);
      await new Promise((r) => setTimeout(r, 800));
    }
    try {
      const AudioCtx = window.AudioContext ?? (window as LegacyAudioWindow).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = 950;
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
        o.start();
        o.stop(ctx.currentTime + 0.36);
      }
    } catch {
      // no audio
    }
    setCards(drawn);
    setText(interp);
    celebrate("Le tirage s'ouvre avec douceur ✦");
    await saveOracleDraw({
      id: todayId(),
      cardIds: drawn,
      interpretation: interp,
      drawnAt: Date.now(),
    });
    await refreshHistory();
  }

  const rows = cards ? cardsWithRoles(cards) : [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 }}
      className={cn("space-y-4", hyperfocus && "space-y-3")}
    >
      <Card className="relative overflow-hidden border-padma-lavender/35 bg-white/90">
        {!hyperfocus && (
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-1/3 -translate-y-1/3 rounded-full bg-padma-lavender/20 blur-3xl" aria-hidden />
        )}
        <CardHeader className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="h-5 w-5 text-padma-champagne" aria-hidden />
            <CardTitle className="font-cinzel text-xl font-normal tracking-[0.06em] text-padma-night">
              Tirage oracle du jour
            </CardTitle>
          </div>
          <CardDescription className="text-padma-night/65">
            Trois arcanes majeurs pour te recentrer : energie, conseil, potentiel - avec une lecture poetique, claire et bienveillante.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-6">
          {loading && (
            <p className="text-center text-sm text-padma-night/60">Les cartes se devoilent en silence...</p>
          )}

          <AnimatePresence mode="wait">
            {mixing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mx-auto grid max-w-sm grid-cols-3 gap-3"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={`mix-${i}`}
                    className="h-28 rounded-2xl border border-padma-champagne/40 bg-gradient-to-br from-padma-lavender/30 to-padma-pearl/20"
                    animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.14 }}
                  />
                ))}
              </motion.div>
            )}
            {!loading && cards && (
              <motion.div
                key={cards.join("-")}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="grid gap-3 sm:grid-cols-3"
              >
                {rows.map(({ label, card }, i) =>
                  i < revealedCount ? (
                  <motion.div
                    key={`${card.id}-${label}`}
                    initial={{ opacity: 0, y: 20, rotateY: 90 }}
                    animate={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.55 }}
                    className="relative flex flex-col rounded-2xl border border-padma-champagne/40 bg-gradient-to-b from-padma-cream/95 to-padma-lavender/10 p-4 text-center"
                  >
                    <motion.div
                      className="pointer-events-none absolute -inset-2 rounded-2xl bg-[radial-gradient(circle,rgba(201,169,110,0.22)_0%,transparent_68%)]"
                      animate={{ opacity: [0.25, 0.65, 0.25] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                    <span className="font-display text-[0.65rem] uppercase tracking-[0.18em] text-padma-pearl">
                      {label}
                    </span>
                    <span className="mt-3 font-cinzel text-lg text-padma-night">{card.name}</span>
                    <span className="mt-2 text-xs leading-relaxed text-padma-night/70">{card.keyword}</span>
                  </motion.div>
                  ) : (
                    <div key={`back-${label}-${i}`} className="h-[128px] rounded-2xl border border-padma-lavender/25 bg-[#11182f]" />
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {text && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-padma-pearl/35 bg-white/70 p-4 text-sm leading-[1.75] text-padma-night/85"
            >
              {text}
            </motion.p>
          )}

          <Button
            type="button"
            variant="oracle"
            size="lg"
            className="font-cinzel w-full gap-2 rounded-2xl tracking-wide"
            onClick={() => void newDraw()}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Ouvrir un nouveau tirage
          </Button>

          <div className="rounded-2xl border border-padma-pearl/30 bg-padma-cream/40 p-4">
            <p className="mb-3 flex items-center gap-2 font-display text-xs uppercase tracking-[0.2em] text-padma-night/55">
              <History className="h-4 w-4" aria-hidden />
              Sept derniers jours
            </p>
            <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
              {history.length === 0 && (
                <li className="text-padma-night/55">Les tirages sauvegardés apparaîtront ici (Dexie).</li>
              )}
              {history.map((h) => (
                <li
                  key={h.id}
                  className="flex flex-col rounded-lg border border-padma-champagne/20 bg-white/60 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium text-padma-night">{h.id}</span>
                  <span className="text-xs text-padma-night/65">
                    {h.cardIds.map((id) => getMajorById(id).name).join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}
