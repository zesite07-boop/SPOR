"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarHeart, Download, Link2, MoonStar } from "lucide-react";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { retreatSlug, type RetreatDefinition } from "@/lib/reservation/catalog";
import { countDaysInclusive } from "@/lib/logistics/default-planning";
import { ensureRetreatLogistics } from "@/lib/logistics/seed-logistics";
import { setTaskDone, setRetreatStatus, updateParticipantRoom, updateParticipantTransfer } from "@/lib/logistics/logistics-actions";
import type {
  LogisticsParticipant,
  LogisticsRetreatMeta,
  LogisticsRetreatStatus,
  LogisticsTask,
  ReservationRecord,
} from "@/lib/db/schema";
import { db } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { HyperfocusToolbar } from "@/components/layout/hyperfocus-toolbar";
import { PlanningSortableDay } from "@/components/logistics/planning-sortable-day";
import { ParticipantCard } from "@/components/logistics/participant-card";
import { ChecklistItem } from "@/components/logistics/checklist-item";
import { LogisticsGroceryPanel } from "@/components/logistics/logistics-grocery-panel";
import { LogisticsStatusBadge } from "@/components/logistics/logistics-status-badge";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { getMajorById } from "@/lib/oracle/tarot-major";
import { syncReminderSchedule } from "@/lib/notifications/reminders";

function dayTitle(startIso: string, dayIndex: number) {
  const d = new Date(startIso + "T12:00:00");
  d.setDate(d.getDate() + dayIndex);
  const wd = d.toLocaleDateString("fr-FR", { weekday: "long" });
  const rest = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  return `Jour ${dayIndex + 1} — ${wd} ${rest}`;
}

const STATUS_OPTIONS: { id: LogisticsRetreatStatus; label: string }[] = [
  { id: "preparation", label: "Préparation" },
  { id: "ready", label: "Prêt · vert" },
  { id: "in_progress", label: "En cours sur place" },
  { id: "completed", label: "Complété" },
];

export function LogisticsRetreatDetail({ retreat }: { retreat: RetreatDefinition }) {
  const hyperfocus = useUiStore((s) => s.hyperfocus);
  const [meta, setMeta] = useState<LogisticsRetreatMeta | null>(null);
  const [tasks, setTasks] = useState<LogisticsTask[]>([]);
  const [participants, setParticipants] = useState<LogisticsParticipant[]>([]);
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [journalBusy, setJournalBusy] = useState(false);

  const refresh = useCallback(async () => {
    await ensureRetreatLogistics(retreat);
    await syncReminderSchedule();
    if (!db) return;
    const [t, p, m] = await Promise.all([
      db.logisticsTasks.where("retreatId").equals(retreat.id).toArray(),
      db.logisticsParticipants.where("retreatId").equals(retreat.id).toArray(),
      db.logisticsMeta.get(retreat.id),
    ]);
    const res = await db.reservations.where("retreatId").equals(retreat.id).toArray();
    setTasks(t);
    setParticipants(p.sort((a, b) => a.sortOrder - b.sortOrder));
    setReservations(res);
    setMeta(m ?? { retreatId: retreat.id, status: "preparation", updatedAt: Date.now() });
  }, [retreat]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const planningByDay = useMemo(() => {
    const map = new Map<number, LogisticsTask[]>();
    for (const t of tasks) {
      if (t.section !== "planning" || t.dayIndex === null) continue;
      const arr = map.get(t.dayIndex) ?? [];
      arr.push(t);
      map.set(t.dayIndex, arr);
    }
    return map;
  }, [tasks]);

  const dayIndices = useMemo(() => {
    const n = countDaysInclusive(retreat.startDate, retreat.endDate);
    return Array.from({ length: n }, (_, i) => i);
  }, [retreat.startDate, retreat.endDate]);

  const checklist = (section: LogisticsTask["section"]) =>
    tasks.filter((t) => t.section === section).sort((a, b) => a.sortOrder - b.sortOrder);

  async function toggleTask(id: string, done: boolean) {
    await setTaskDone(id, !done);
    await refresh();
  }

  async function changeStatus(s: LogisticsRetreatStatus) {
    await setRetreatStatus(retreat.id, s);
    await refresh();
  }

  async function copyPublicUrl() {
    const url = `${window.location.origin}/r/${retreatSlug(retreat)}`;
    await navigator.clipboard.writeText(url);
  }

  function isRetreatActiveNow() {
    const now = new Date();
    const start = new Date(retreat.startDate + "T00:00:00");
    const end = new Date(retreat.endDate + "T23:59:59");
    return now >= start && now <= end;
  }

  function ymd(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  async function buildJournalPdf(p: LogisticsParticipant): Promise<ArrayBuffer> {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    const m = 14;
    doc.setFillColor(248, 244, 237);
    doc.roundedRect(m, 12, w - m * 2, 28, 2, 2, "F");
    doc.setDrawColor(212, 175, 136);
    doc.roundedRect(m, 12, w - m * 2, 28, 2, 2, "S");
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text("Serey Padma by Céline", m + 2, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Journal de retraite - souvenir personnalise", m + 2, 26);
    doc.setFontSize(9);
    doc.text(`${p.name} · ${retreat.title}`, m + 2, 32);

    const firstKey = retreat.startDate;
    const lastKey = retreat.endDate;
    const firstDraw = (await db?.oracleDraws.get(firstKey)) ?? null;
    const lastDraw = (await db?.oracleDraws.get(lastKey)) ?? null;
    const firstArcana = getMajorById((firstDraw?.cardIds?.[0] ?? 0) % 22);
    const endArcana = getMajorById((lastDraw?.cardIds?.[0] ?? 19) % 22);

    let y = 50;
    const lines = [
      `Participante : ${p.name}`,
      `Retraite : ${retreat.title}`,
      `Dates : ${retreat.startDate} -> ${retreat.endDate}`,
      "",
      `Tirage du premier jour : ${firstArcana.name}`,
      `Intention initiale : ${p.intentions ?? "Intentions non renseignees"}`,
      `Energie de fin de sejour : ${endArcana.name}`,
      "",
      "Message de cloture :",
      "Merci d'avoir marche dans ce cercle. Que la lumiere recueillie ici continue de t'accompagner, avec douceur et confiance. - Céline",
    ];
    doc.setTextColor(44, 62, 80);
    for (const line of lines) {
      const wrapped = doc.splitTextToSize(line, w - m * 2);
      doc.text(wrapped, m, y);
      y += wrapped.length * 6;
    }
    doc.setFontSize(8);
    doc.setTextColor(212, 175, 136);
    doc.text(`Serey Padma by Céline · ${new Date().toLocaleDateString("fr-FR")}`, m, 288);
    return doc.output("arraybuffer");
  }

  async function generateJournalsZip() {
    if (!participants.length) return;
    setJournalBusy(true);
    try {
      const zip = new JSZip();
      for (const p of participants) {
        const buf = await buildJournalPdf(p);
        const safe = p.name.toLowerCase().replace(/[^a-z0-9]+/gi, "-");
        zip.file(`journal-${safe}.pdf`, buf);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      const key = ymd(new Date());
      a.download = `journaux-retraite-${retreat.id}-${key}.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setJournalBusy(false);
    }
  }

  async function downloadSingleJournal(p: LogisticsParticipant) {
    const buf = await buildJournalPdf(p);
    const blob = new Blob([buf], { type: "application/pdf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `journal-${p.name.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function downloadPdf() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;
    let y = 18;

    const colors = {
      champagne: [212, 175, 136] as const,
      lavender: [197, 180, 212] as const,
      navy: [44, 62, 80] as const,
      soft: [248, 244, 237] as const,
    };

    const drawHeader = () => {
      doc.setFillColor(...colors.soft);
      doc.roundedRect(margin, 10, pageW - margin * 2, 24, 2, 2, "F");
      doc.setDrawColor(...colors.champagne);
      doc.roundedRect(margin, 10, pageW - margin * 2, 24, 2, 2, "S");
      doc.setTextColor(...colors.navy);
      doc.setFont("times", "bold");
      doc.setFontSize(17);
      doc.text("Serey Padma", margin + 4, 18);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Logistique retraite - export premium", margin + 4, 24);
      doc.setTextColor(...colors.champagne);
      doc.setFont("helvetica", "bold");
      doc.text(retreat.title, margin + 4, 30);
      y = 40;
    };

    const ensureSpace = (needed = 10) => {
      if (y + needed < pageH - 16) return;
      doc.addPage();
      drawHeader();
    };

    const writeSectionTitle = (title: string) => {
      ensureSpace(10);
      doc.setFillColor(...colors.lavender);
      doc.roundedRect(margin, y - 5, pageW - margin * 2, 8, 1.5, 1.5, "F");
      doc.setTextColor(...colors.navy);
      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.text(title, margin + 2, y);
      y += 8;
    };

    const writeLines = (lines: string[], size = 10) => {
      doc.setTextColor(...colors.navy);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(size);
      for (const line of lines) {
        const wrapped = doc.splitTextToSize(line, pageW - margin * 2 - 4);
        for (const w of wrapped) {
          ensureSpace(6);
          doc.text(w, margin + 2, y);
          y += 5;
        }
      }
    };

    drawHeader();
    writeLines([
      `Destination: ${retreat.destinationLabel}`,
      `Statut operationnel: ${meta?.status ?? "preparation"}`,
      `Participants: ${participants.length}`,
    ]);
    y += 2;

    writeSectionTitle("Planning structure");
    for (const d of dayIndices) {
      const tasksForDay = (planningByDay.get(d) ?? []).sort((a, b) => a.sortOrder - b.sortOrder);
      writeLines([dayTitle(retreat.startDate, d)], 10);
      if (tasksForDay.length === 0) {
        writeLines(["- Aucune tache planifiee."], 9);
      } else {
        writeLines(tasksForDay.map((t) => `- ${t.label}${t.done ? " (fait)" : ""}`), 9);
      }
      y += 2;
    }

    writeSectionTitle("Participantes");
    if (participants.length === 0) {
      writeLines(["- Aucune participante enregistree."], 9);
    } else {
      writeLines(
        participants.map(
          (p) =>
            `- ${p.name} | chambre: ${p.roomLabel ?? "standard"} | transfert: ${p.transferStatus ?? "non precise"} | allergies: ${p.allergies ?? "aucune"}`
        ),
        9
      );
    }
    y += 2;

    const sections: Array<{ label: string; items: LogisticsTask[] }> = [
      { label: "Materiel Reiki & tenue du lieu", items: checklist("material") },
      { label: "Transport & acces", items: checklist("transport") },
      { label: "Courses", items: checklist("groceries") },
    ];

    for (const s of sections) {
      writeSectionTitle(s.label);
      if (s.items.length === 0) writeLines(["- Aucun element."], 9);
      else writeLines(s.items.map((t) => `- ${t.label}${t.done ? " (ok)" : ""}`), 9);
      y += 2;
    }

    doc.setFontSize(8);
    doc.setTextColor(...colors.champagne);
    doc.text("Serey Padma - document logistique confidentiel", margin, pageH - 8);
    doc.text(new Date().toLocaleString("fr-FR"), pageW - margin, pageH - 8, { align: "right" });

    const safeTitle = retreat.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-");
    doc.save(`serey-padma-logistique-${safeTitle}.pdf`);
  }

  return (
    <div className={cn("pb-20", hyperfocus && "space-y-6")} id="logistics-print-root">
      <header className={cn("mb-8 space-y-4", hyperfocus && "mb-4 space-y-2")}>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/logistique"
            className="text-xs font-medium text-padma-night/60 hover:text-padma-lavender dark:text-padma-cream/60"
          >
            ← Logistique
          </Link>
          <Button asChild variant="secondary" size="sm" className="print:hidden rounded-full">
            <Link href="/reservation">
              <CalendarHeart className="h-4 w-4" aria-hidden />
              Voir réservations publiques
            </Link>
          </Button>
          <Button type="button" variant="oracle" size="sm" className="print:hidden ml-auto font-cinzel rounded-full" onClick={downloadPdf}>
            <Download className="h-4 w-4" aria-hidden />
            Telecharger PDF
          </Button>
          <Button type="button" variant="secondary" size="sm" className="print:hidden rounded-full" onClick={() => void copyPublicUrl()}>
            <Link2 className="h-4 w-4" aria-hidden />
            Copier URL publique
          </Button>
          {isRetreatActiveNow() ? (
            <Button asChild type="button" variant="secondary" size="sm" className="print:hidden rounded-full">
              <Link href={`/mode-retraite/${retreat.id}`}>
                <MoonStar className="h-4 w-4" aria-hidden />
                Activer le mode retraite
              </Link>
            </Button>
          ) : null}
          <Button type="button" variant="secondary" size="sm" className="print:hidden rounded-full" onClick={() => void generateJournalsZip()}>
            <Download className="h-4 w-4" aria-hidden />
            {journalBusy ? "Generation..." : "Generer les journaux"}
          </Button>
        </div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-center gap-3">
            {meta && <LogisticsStatusBadge status={meta.status} />}
            <label className="print:hidden flex items-center gap-2 text-xs text-padma-night/60 dark:text-padma-cream/65">
              Statut opérationnel
              <select
                value={meta?.status ?? "preparation"}
                onChange={(e) => void changeStatus(e.target.value as LogisticsRetreatStatus)}
                className="rounded-lg border border-padma-champagne/40 bg-white px-2 py-1 text-sm dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <h1 className={cn("mt-3 font-cinzel text-3xl text-padma-night dark:text-padma-cream", hyperfocus && "text-2xl")}>
            {retreat.title}
          </h1>
          <p className="mt-2 text-sm text-padma-night/75 dark:text-padma-cream/80">{retreat.destinationLabel}</p>
        </motion.div>
        <div className="print:hidden">
          <HyperfocusToolbar />
        </div>
      </header>

      <section className={cn("space-y-6", hyperfocus && "space-y-4")}>
        <h2 className="font-cinzel text-xl text-padma-night dark:text-padma-cream">Planning jour après jour</h2>
        <p className="text-xs text-padma-night/60 dark:text-padma-cream/65">
          Environ un tiers du programme en temps libre (repéré ✦). Glisse les blocs pour réorganiser chaque journée.
        </p>
        <div className={cn("grid gap-6 lg:grid-cols-2", hyperfocus && "gap-4")}>
          {dayIndices.map((d) => (
            <PlanningSortableDay
              key={d}
              retreatId={retreat.id}
              dayIndex={d}
              tasks={planningByDay.get(d) ?? []}
              dayLabel={dayTitle(retreat.startDate, d)}
              hyperfocus={hyperfocus}
              onReordered={() => void refresh()}
            />
          ))}
        </div>
      </section>

      <section className={cn("mt-12 space-y-4", hyperfocus && "mt-8")}>
        <h2 className="font-cinzel text-xl text-padma-night dark:text-padma-cream">Participantes</h2>
        <div className={cn("grid gap-4 md:grid-cols-2", hyperfocus && "gap-3")}>
          {participants.map((p) => (
            (() => {
              const reservation = reservations.find((r) => r.id === p.sourceReservationId);
              const selectedOptions = [
                reservation?.soloRoom ? "Chambre solo" : null,
                reservation?.airportTransfer ? "Transfert aeroport/gare" : null,
              ].filter(Boolean) as string[];
              const paymentStatus = reservation
                ? reservation.status === "paid"
                  ? "Paye"
                  : reservation.status === "checkout_created"
                    ? "Checkout cree"
                    : reservation.status === "checkout_pending"
                      ? "En attente paiement"
                      : reservation.status
                : undefined;
              return (
            <ParticipantCard
              key={p.id}
              p={p}
              hyperfocus={hyperfocus}
              paymentStatus={paymentStatus}
              selectedOptions={selectedOptions}
              onRoomChange={(room) =>
                void (async () => {
                  await updateParticipantRoom(p.id, room);
                  await refresh();
                })()
              }
              onTransferChange={(t) =>
                void (async () => {
                  await updateParticipantTransfer(p.id, t);
                  await refresh();
                })()
              }
            />
              );
            })()
          ))}
        </div>
        {participants.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {participants.map((p) => (
              <Button key={`journal-${p.id}`} type="button" variant="secondary" size="sm" className="rounded-full" onClick={() => void downloadSingleJournal(p)}>
                Journal {p.name}
              </Button>
            ))}
          </div>
        )}
      </section>

      <section className={cn("mt-12 grid gap-10 lg:grid-cols-2", hyperfocus && "mt-8 gap-6")}>
        <div className="space-y-3">
          <h3 className="font-cinzel text-lg text-padma-night dark:text-padma-cream">Matériel Reiki &amp; tenue du lieu</h3>
          {checklist("material").map((t) => (
            <ChecklistItem key={t.id} label={t.label} done={t.done} onToggle={() => void toggleTask(t.id, t.done)} compact={hyperfocus} />
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="font-cinzel text-lg text-padma-night dark:text-padma-cream">Transport &amp; accès</h3>
          {checklist("transport").map((t) => (
            <ChecklistItem key={t.id} label={t.label} done={t.done} onToggle={() => void toggleTask(t.id, t.done)} compact={hyperfocus} />
          ))}
        </div>
      </section>

      <section className={cn("mt-10 space-y-3", hyperfocus && "mt-6")}>
        <h3 className="font-cinzel text-lg text-padma-night dark:text-padma-cream">Check-list courses (validation)</h3>
        {checklist("groceries").map((t) => (
          <ChecklistItem key={t.id} label={t.label} done={t.done} onToggle={() => void toggleTask(t.id, t.done)} compact={hyperfocus} />
        ))}
      </section>

      <div className={cn("mt-12", hyperfocus && "mt-8")}>
        <LogisticsGroceryPanel retreat={retreat} participants={participants} />
      </div>
    </div>
  );
}
