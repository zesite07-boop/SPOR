"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  drawChakra,
  drawFree,
  drawLifePath,
  drawMonthly,
  drawRetreat,
  interpretChakra,
  interpretFree,
  interpretLifePath,
  interpretMonthly,
  interpretRetreat,
} from "@/lib/oracle/draw-engines";
import { saveOracleSession, sessionTitleForKind } from "@/lib/oracle/session-persist";
import type { OasisProfile, OracleSession } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { OracleCardTarot } from "@/components/oracle/oracle-card-tarot";
import { OracleInterpretationBlock } from "@/components/oracle/oracle-interpretation-block";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

type DrawTab = "chakra" | "life" | "monthly" | "retreat" | "free";

export function OracleDrawsPanel({
  profile,
  onSaved,
}: {
  profile: OasisProfile | null;
  onSaved?: () => void;
}) {
  const hyperfocus = useUiStore((s) => s.hyperfocus);
  const celebrate = useUiStore((s) => s.celebrate);
  const [tab, setTab] = useState<DrawTab>("chakra");
  const [chakraMode, setChakraMode] = useState<"full" | "focus">("full");
  const [freeCount, setFreeCount] = useState(3);
  const [freeIntention, setFreeIntention] = useState("");
  const [lastText, setLastText] = useState<string | null>(null);
  const [lastCards, setLastCards] = useState<{ id: number; label?: string }[] | null>(null);

  const birthDate = profile?.birthDate ? new Date(profile.birthDate + "T12:00:00") : null;
  const fullName = profile?.fullName ?? profile?.displayName ?? "";

  const monthLabel = useMemo(
    () =>
      new Date().toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      }),
    []
  );

  const persist = useCallback(
    async (payload: Omit<OracleSession, "id" | "drawnAt"> & { id?: string }) => {
      await saveOracleSession(payload);
      onSaved?.();
    },
    [onSaved]
  );

  async function runChakra() {
    const r = drawChakra(chakraMode === "full" ? "full" : "focus");
    const text = interpretChakra(r);
    setLastCards(r.cardIds.map((id, i) => ({ id, label: r.labels[i] })));
    setLastText(text);
    celebrate("Lecture chakra ancree et disponible ✦");
    await persist({
      drawType: r.kind,
      title: sessionTitleForKind(r.kind),
      cardIds: r.cardIds,
      positionLabels: [...r.labels],
      interpretation: text,
    });
  }

  async function runLifePath() {
    if (!birthDate || Number.isNaN(birthDate.getTime())) {
      setLastText(
        "Pour un chemin de vie numérologique complété par les cartes, renseigne ta date de naissance dans l’onglet Profil oracle — elle reste sur ton appareil."
      );
      setLastCards(null);
      return;
    }
    const r = drawLifePath(birthDate);
    const text = interpretLifePath(r, birthDate, fullName);
    setLastCards(r.cardIds.map((id, i) => ({ id, label: r.labels[i] })));
    setLastText(text);
    celebrate("Chemin de vie revele avec clarte ✦");
    await persist({
      drawType: "life_path",
      title: sessionTitleForKind("life_path"),
      cardIds: r.cardIds,
      positionLabels: [...r.labels],
      interpretation: text,
      meta: { lifePath: r.lifePath },
    });
  }

  async function runMonthly() {
    const r = drawMonthly();
    const text = interpretMonthly(r, monthLabel);
    setLastCards(r.cardIds.map((id, i) => ({ id, label: r.labels[i] })));
    setLastText(text);
    celebrate("Projection mensuelle en douceur ✦");
    await persist({
      drawType: "monthly",
      title: `${sessionTitleForKind("monthly")} — ${monthLabel}`,
      cardIds: r.cardIds,
      positionLabels: [...r.labels],
      interpretation: text,
      meta: { monthLabel },
    });
  }

  async function runRetreat() {
    const r = drawRetreat();
    const text = interpretRetreat(r);
    setLastCards(r.cardIds.map((id, i) => ({ id, label: r.labels[i] })));
    setLastText(text);
    celebrate("Tirage retraite en harmonie ✦");
    await persist({
      drawType: "retreat",
      title: sessionTitleForKind("retreat"),
      cardIds: r.cardIds,
      positionLabels: [...r.labels],
      interpretation: text,
    });
  }

  async function runFree() {
    const r = drawFree(freeCount);
    const text = interpretFree(r.cardIds, freeIntention);
    setLastCards(r.cardIds.map((id) => ({ id })));
    setLastText(text);
    celebrate("Intuition captee, message recu ✦");
    await persist({
      drawType: "free",
      title: `${sessionTitleForKind("free")} (${r.cardIds.length})`,
      cardIds: r.cardIds,
      interpretation: text,
      meta: { intention: freeIntention || undefined },
    });
  }

  const tabs: { id: DrawTab; label: string }[] = [
    { id: "chakra", label: "Chakras" },
    { id: "life", label: "Chemin de vie" },
    { id: "monthly", label: "Mensuel" },
    { id: "retreat", label: "Retraite" },
    { id: "free", label: "Libre" },
  ];

  return (
    <div className={cn("space-y-8", hyperfocus && "space-y-6")}>
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button
            key={t.id}
            type="button"
            size="sm"
            variant={tab === t.id ? "oracle" : "secondary"}
            className="rounded-full font-cinzel text-xs"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {tab === "chakra" && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <p className="text-sm leading-relaxed text-padma-night/75">
            Sept centres ou focus Corps · Coeur · Esprit : une lecture stable, sans remise, pour apaiser et orienter ta journee.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={chakraMode === "full" ? "oracle" : "secondary"}
              size="sm"
              className="rounded-full"
              onClick={() => setChakraMode("full")}
            >
              7 cartes — roue complète
            </Button>
            <Button
              type="button"
              variant={chakraMode === "focus" ? "oracle" : "secondary"}
              size="sm"
              className="rounded-full"
              onClick={() => setChakraMode("focus")}
            >
              3 cartes — focus
            </Button>
          </div>
          <Button type="button" variant="oracle" className="font-cinzel rounded-2xl" onClick={() => void runChakra()}>
            Tirer le chakra
          </Button>
        </motion.section>
      )}

      {tab === "life" && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <p className="text-sm leading-relaxed text-padma-night/75">
            Numerologie du chemin de vie et trois temps du tarot : une lecture intime, elegante et professionnalisante.
          </p>
          <Button type="button" variant="oracle" className="font-cinzel rounded-2xl" onClick={() => void runLifePath()}>
            Révéler mon chemin de vie
          </Button>
        </motion.section>
      )}

      {tab === "monthly" && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <p className="text-sm text-padma-night/75">
            Quatre cartes pour le mois en cours : <span className="italic">{monthLabel}</span>, pour avancer avec calme et precision.
          </p>
          <Button type="button" variant="oracle" className="font-cinzel rounded-2xl" onClick={() => void runMonthly()}>
            Tirage mensuel
          </Button>
        </motion.section>
      )}

      {tab === "retreat" && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <p className="text-sm text-padma-night/75">
            Cinq portes pour preparer ou integrer une retraite : intention, corps, relation, ame, ancrage.
          </p>
          <Button type="button" variant="oracle" className="font-cinzel rounded-2xl" onClick={() => void runRetreat()}>
            Tirage retraite
          </Button>
        </motion.section>
      )}

      {tab === "free" && (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <label className="block text-xs font-medium uppercase tracking-wide text-padma-night/55">
            Nombre de cartes (1 à 7)
          </label>
          <input
            type="range"
            min={1}
            max={7}
            value={freeCount}
            onChange={(e) => setFreeCount(Number(e.target.value))}
            className="w-full accent-padma-lavender"
          />
          <p className="text-sm text-padma-night/70">{freeCount} carte(s)</p>
          <textarea
            rows={2}
            value={freeIntention}
            onChange={(e) => setFreeIntention(e.target.value)}
            placeholder="Intention ou question douce (optionnel)…"
            className="w-full rounded-2xl border border-padma-champagne/40 bg-white/85 px-4 py-3 text-sm text-padma-night"
          />
          <Button type="button" variant="oracle" className="font-cinzel rounded-2xl" onClick={() => void runFree()}>
            Tirer
          </Button>
        </motion.section>
      )}

      {lastCards && lastCards.length > 0 && (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className={cn(
            "grid grid-cols-2 gap-4 px-1 sm:grid-cols-3 sm:px-2",
            lastCards.length > 6 && "lg:grid-cols-3"
          )}
        >
          {lastCards.map((c, i) => (
            <OracleCardTarot key={`${c.id}-${i}`} cardId={c.id} positionLabel={c.label} index={i} compact={false} />
          ))}
        </motion.div>
      )}

      {lastText && <OracleInterpretationBlock text={lastText} className="pb-24" />}
    </div>
  );
}
