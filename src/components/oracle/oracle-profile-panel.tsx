"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Heart, UserRound } from "lucide-react";
import { loadLocalProfile, saveLocalProfile } from "@/lib/db/profile-local";
import { computeOraclePortrait } from "@/lib/oracle/profile-oracle";
import { listOracleSessions } from "@/lib/oracle/session-persist";
import { LIFE_PATH_THEMES, SOUL_URGE_THEMES } from "@/lib/oracle/numerology-extended";
import { getMajorById } from "@/lib/oracle/tarot-major";
import { Button } from "@/components/ui/button";
import { OracleInterpretationBlock } from "@/components/oracle/oracle-interpretation-block";

export function OracleProfilePanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const [sessions, setSessions] = useState<Awaited<ReturnType<typeof listOracleSessions>>>([]);
  const [birthDate, setBirthDate] = useState("");
  const [fullName, setFullName] = useState("");
  const [beforeRetreat, setBeforeRetreat] = useState("");
  const [afterRetreat, setAfterRetreat] = useState("");
  const [savedHint, setSavedHint] = useState(false);

  useEffect(() => {
    void (async () => {
      const p = await loadLocalProfile();
      setBirthDate(p?.birthDate ?? "");
      setFullName(p?.fullName ?? p?.displayName ?? "");
      setBeforeRetreat(p?.oracleEvolutionBefore ?? "");
      setAfterRetreat(p?.oracleEvolutionAfter ?? "");
      setSessions(await listOracleSessions(80));
    })();
  }, [refreshKey]);

  const birth = useMemo(() => {
    if (!birthDate) return null;
    const d = new Date(birthDate + "T12:00:00");
    return Number.isNaN(d.getTime()) ? null : d;
  }, [birthDate]);

  const portrait = useMemo(() => computeOraclePortrait(birth, fullName, sessions), [birth, fullName, sessions]);

  const synthesis = useMemo(() => {
    const parts: string[] = [];
    if (portrait.sunSign && portrait.lifePath != null) {
      parts.push(
        `Ton Soleil naissant en ${portrait.sunSign} dialogue avec un chemin de vie ${portrait.lifePath} : ${LIFE_PATH_THEMES[portrait.lifePath] ?? "tu marches avec douceur."}`
      );
    }
    if (portrait.soulUrge != null) {
      parts.push(`Nombre d’âme ${portrait.soulUrge} : ${SOUL_URGE_THEMES[portrait.soulUrge] ?? "ton cœur cherche l’harmonie."}`);
    }
    if (portrait.dominantArcanaId != null && portrait.dominantLabel) {
      const card = getMajorById(portrait.dominantArcanaId);
      parts.push(
        `Dans tes tirages récents, ${portrait.dominantLabel} revient comme une signature : ${card.keyword} — ${card.gentle}`
      );
    }
    if (!parts.length) {
      return "Renseigne ta date de naissance et ton nom pour faire émerger une première synthèse — tout reste sur ton appareil.";
    }
    return parts.join("\n\n");
  }, [portrait]);

  async function save() {
    await saveLocalProfile({
      birthDate: birthDate || undefined,
      fullName: fullName || undefined,
      displayName: fullName || undefined,
      oracleEvolutionBefore: beforeRetreat || undefined,
      oracleEvolutionAfter: afterRetreat || undefined,
    });
    await loadLocalProfile();
    setSavedHint(true);
    setTimeout(() => setSavedHint(false), 2400);
  }

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-padma-champagne/35 bg-white/80 p-6 dark:border-padma-lavender/25 dark:bg-padma-night/50"
      >
        <div className="mb-4 flex items-center gap-2 font-cinzel text-lg text-padma-night dark:text-padma-cream">
          <UserRound className="h-5 w-5 text-padma-lavender" aria-hidden />
          Identité oracle
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bd" className="text-xs uppercase tracking-wide text-padma-night/55 dark:text-padma-cream/55">
              Date de naissance
            </label>
            <input
              id="bd"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm text-padma-night dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
            />
          </div>
          <div>
            <label htmlFor="fn" className="text-xs uppercase tracking-wide text-padma-night/55 dark:text-padma-cream/55">
              Prénom &amp; nom (nombre d’âme)
            </label>
            <input
              id="fn"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="ex. Claire Dupont"
              className="mt-1 w-full rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm text-padma-night dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
            />
          </div>
        </div>
        <Button type="button" variant="oracle" className="mt-4 font-cinzel rounded-2xl" onClick={() => void save()}>
          Enregistrer le profil
        </Button>
        {savedHint && (
          <p className="mt-2 text-xs text-padma-night/60 dark:text-padma-cream/65">Profil sauvegardé localement (Dexie).</p>
        )}
      </motion.section>

      <OracleInterpretationBlock title="Synthèse oracle personnelle" text={synthesis} />

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-padma-lavender/30 bg-gradient-to-br from-padma-lavender/10 to-transparent p-6 dark:from-padma-lavender/15"
      >
        <div className="mb-3 flex items-center gap-2 font-cinzel text-lg text-padma-night dark:text-padma-cream">
          <Heart className="h-5 w-5 text-padma-champagne" aria-hidden />
          Évolution retraite
        </div>
        <p className="mb-4 text-sm text-padma-night/72 dark:text-padma-cream/78">
          Notes libres pour ton avant / après — tu pourras relire comment ton portrait énergétique respire dans le temps.
        </p>
        <label className="text-xs uppercase tracking-wide text-padma-night/55 dark:text-padma-cream/55">Avant la retraite</label>
        <textarea
          rows={3}
          value={beforeRetreat}
          onChange={(e) => setBeforeRetreat(e.target.value)}
          onBlur={() => void save()}
          className="mt-1 mb-4 w-full rounded-xl border border-padma-champagne/35 bg-white/90 px-3 py-2 text-sm dark:border-padma-lavender/30 dark:bg-padma-night/55 dark:text-padma-cream"
        />
        <label className="text-xs uppercase tracking-wide text-padma-night/55 dark:text-padma-cream/55">Après la retraite</label>
        <textarea
          rows={3}
          value={afterRetreat}
          onChange={(e) => setAfterRetreat(e.target.value)}
          onBlur={() => void save()}
          className="mt-1 w-full rounded-xl border border-padma-champagne/35 bg-white/90 px-3 py-2 text-sm dark:border-padma-lavender/30 dark:bg-padma-night/55 dark:text-padma-cream"
        />
      </motion.section>
    </div>
  );
}
