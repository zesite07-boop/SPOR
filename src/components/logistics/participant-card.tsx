"use client";

import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import type { LogisticsParticipant } from "@/lib/db/schema";
import { lifePathNumber, soulUrgeNumber } from "@/lib/oracle/numerology-extended";
import { getMajorById } from "@/lib/oracle/tarot-major";
import { Button } from "@/components/ui/button";
import { updateParticipantOracle } from "@/lib/logistics/logistics-actions";
import { cn } from "@/lib/utils";

export function ParticipantCard({
  p,
  hyperfocus,
  onRoomChange,
  onTransferChange,
  paymentStatus,
  selectedOptions,
}: {
  p: LogisticsParticipant;
  hyperfocus?: boolean;
  onRoomChange: (room: string) => void;
  onTransferChange: (t: string) => void;
  paymentStatus?: string;
  selectedOptions?: string[];
}) {
  const [openOracle, setOpenOracle] = useState(false);
  const [oracleName, setOracleName] = useState(p.name);
  const [oracleBirthDate, setOracleBirthDate] = useState(p.birthDate ?? "");

  const profile = useMemo(() => {
    if (!oracleBirthDate) return null;
    const d = new Date(`${oracleBirthDate}T12:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    const lifePath = lifePathNumber(d);
    const soul = soulUrgeNumber(oracleName) ?? 0;
    const arcana = getMajorById((lifePath + soul) % 22);
    const message = `Chere ${oracleName || "participante"}, ton chemin de vie ${lifePath} et ton nombre d'ame ${soul || "?"} t'invitent a ${arcana.keyword}. ${arcana.gentle}`;
    return {
      lifePath,
      soul,
      arcana: arcana.name,
      message,
    };
  }, [oracleBirthDate, oracleName]);

  async function saveOracleToParticipant() {
    await updateParticipantOracle(p.id, {
      name: oracleName || p.name,
      birthDate: oracleBirthDate || undefined,
      oracleNote: profile?.message,
    });
  }

  async function downloadOraclePdf() {
    if (!profile) return;
    await saveOracleToParticipant();
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    const m = 14;
    doc.setFillColor(248, 244, 237);
    doc.roundedRect(m, 10, w - m * 2, 30, 2, 2, "F");
    doc.setDrawColor(212, 175, 136);
    doc.roundedRect(m, 10, w - m * 2, 30, 2, 2, "S");
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text("Serey Padma by Céline", m + 2, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Votre Profil Oracle - prepare avec amour par Céline", m + 2, 24);
    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.text(oracleName, m + 2, 32);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(44, 62, 80);
    let y = 50;
    for (const line of [
      `Chemin de Vie: ${profile.lifePath}`,
      `Nombre d'Ame: ${profile.soul}`,
      `Arcane dominant: ${profile.arcana}`,
      "",
      profile.message,
    ]) {
      const wrapped = doc.splitTextToSize(line, w - m * 2);
      doc.text(wrapped, m, y);
      y += wrapped.length * 6;
    }
    doc.setFontSize(8);
    doc.setTextColor(212, 175, 136);
    doc.text(`Serey Padma by Céline · ${new Date().toLocaleDateString("fr-FR")}`, m, 288);
    doc.save(`profil-oracle-${oracleName || p.name}.pdf`);
  }

  return (
    <motion.div
      layout
      className={cn(
        "rounded-2xl border border-padma-champagne/35 bg-white/80 p-4 dark:border-padma-lavender/25 dark:bg-padma-night/50",
        hyperfocus && "p-3"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-padma-lavender/20 dark:bg-padma-lavender/15">
          <User className="h-5 w-5 text-padma-lavender" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-cinzel text-base text-padma-night dark:text-padma-cream">
            {p.name}{" "}
            <span className="font-sans text-xs font-normal text-padma-night/55 dark:text-padma-cream/60">
              ×{p.partySize}
            </span>
          </p>
          {p.birthDate && (
            <p className="mt-1 text-xs text-padma-night/60 dark:text-padma-cream/65">Naissance · {p.birthDate}</p>
          )}
          {p.allergies && (
            <p className="mt-2 rounded-lg bg-red-50/90 px-2 py-1 text-xs text-red-900/90 dark:bg-red-950/40 dark:text-red-100/95">
              Allergies : {p.allergies}
            </p>
          )}
          {p.intentions && (
            <p className="mt-2 flex gap-2 text-xs leading-relaxed text-padma-night/75 dark:text-padma-cream/78">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-padma-champagne" aria-hidden />
              {p.intentions}
            </p>
          )}
          {p.oracleNote && !p.intentions && (
            <p className="mt-2 text-xs italic text-padma-night/55 dark:text-padma-cream/58">{p.oracleNote}</p>
          )}
        </div>
      </div>
      <div className={cn("mt-4 grid gap-3 sm:grid-cols-2", hyperfocus && "mt-3 gap-2")}>
        <label className="block text-[0.65rem] uppercase tracking-wide text-padma-night/50 dark:text-padma-cream/55">
          Chambre
          <input
            value={p.roomLabel ?? ""}
            onChange={(e) => onRoomChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-padma-champagne/40 bg-white px-2 py-1.5 text-sm dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
          />
        </label>
        <label className="block text-[0.65rem] uppercase tracking-wide text-padma-night/50 dark:text-padma-cream/55">
          Transfert
          <input
            value={p.transferStatus ?? ""}
            onChange={(e) => onTransferChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-padma-champagne/40 bg-white px-2 py-1.5 text-sm dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
          />
        </label>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-padma-champagne/25 bg-white/70 px-2.5 py-2 text-xs dark:border-padma-lavender/20 dark:bg-padma-night/45">
          <p className="font-medium text-padma-night/70 dark:text-padma-cream/75">Statut paiement</p>
          <p className="mt-0.5 text-padma-night dark:text-padma-cream">{paymentStatus ?? "A confirmer"}</p>
        </div>
        <div className="rounded-lg border border-padma-champagne/25 bg-white/70 px-2.5 py-2 text-xs dark:border-padma-lavender/20 dark:bg-padma-night/45">
          <p className="font-medium text-padma-night/70 dark:text-padma-cream/75">Options choisies</p>
          <p className="mt-0.5 text-padma-night dark:text-padma-cream">
            {selectedOptions && selectedOptions.length > 0 ? selectedOptions.join(" · ") : "Aucune option"}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <Button type="button" variant="secondary" className="w-full rounded-xl" onClick={() => setOpenOracle((v) => !v)}>
          Generer son Oracle
        </Button>
      </div>
      {openOracle && (
        <div className="mt-3 rounded-xl border border-padma-champagne/30 bg-white/75 p-3 dark:border-padma-lavender/20 dark:bg-padma-night/45">
          <label className="block text-xs uppercase tracking-wide text-padma-night/60 dark:text-padma-cream/60">
            Prenom
            <input
              value={oracleName}
              onChange={(e) => setOracleName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-padma-champagne/40 bg-white px-2 py-1.5 text-sm dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
            />
          </label>
          <label className="mt-2 block text-xs uppercase tracking-wide text-padma-night/60 dark:text-padma-cream/60">
            Date de naissance
            <input
              type="date"
              value={oracleBirthDate}
              onChange={(e) => setOracleBirthDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-padma-champagne/40 bg-white px-2 py-1.5 text-sm dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
            />
          </label>
          {profile && (
            <div className="mt-3 rounded-lg border border-padma-lavender/25 bg-padma-cream/35 p-2 text-xs dark:bg-padma-night/40">
              <p>Chemin de Vie : {profile.lifePath}</p>
              <p>Nombre d&apos;Ame : {profile.soul}</p>
              <p>Arcane dominant : {profile.arcana}</p>
              <p className="mt-1">{profile.message}</p>
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button type="button" onClick={() => void saveOracleToParticipant()} className="rounded-xl">
              Sauver profil
            </Button>
            <Button type="button" variant="secondary" onClick={() => void downloadOraclePdf()} className="rounded-xl">
              Export PDF cadeau
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
