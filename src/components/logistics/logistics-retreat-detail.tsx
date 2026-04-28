"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarHeart, Printer } from "lucide-react";
import type { RetreatDefinition } from "@/lib/reservation/catalog";
import { countDaysInclusive } from "@/lib/logistics/default-planning";
import { ensureRetreatLogistics } from "@/lib/logistics/seed-logistics";
import { setTaskDone, setRetreatStatus, updateParticipantRoom, updateParticipantTransfer } from "@/lib/logistics/logistics-actions";
import type {
  LogisticsParticipant,
  LogisticsRetreatMeta,
  LogisticsRetreatStatus,
  LogisticsTask,
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

  const refresh = useCallback(async () => {
    await ensureRetreatLogistics(retreat);
    if (!db) return;
    const [t, p, m] = await Promise.all([
      db.logisticsTasks.where("retreatId").equals(retreat.id).toArray(),
      db.logisticsParticipants.where("retreatId").equals(retreat.id).toArray(),
      db.logisticsMeta.get(retreat.id),
    ]);
    setTasks(t);
    setParticipants(p.sort((a, b) => a.sortOrder - b.sortOrder));
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

  function handlePrint() {
    window.print();
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
          <Button type="button" variant="oracle" size="sm" className="print:hidden ml-auto font-cinzel rounded-full" onClick={handlePrint}>
            <Printer className="h-4 w-4" aria-hidden />
            Imprimer / PDF
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
            <ParticipantCard
              key={p.id}
              p={p}
              hyperfocus={hyperfocus}
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
          ))}
        </div>
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
