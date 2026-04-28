"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, CalendarRange, ClipboardList, LayoutList } from "lucide-react";
import { listUpcomingRetreats, type RetreatDefinition, type RetreatDestinationId } from "@/lib/reservation/catalog";
import type { LogisticsRetreatStatus } from "@/lib/db/schema";
import { db } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { HyperfocusToolbar } from "@/components/layout/hyperfocus-toolbar";
import { LogisticsRetreatCard } from "@/components/logistics/logistics-retreat-card";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "calendar";
type StatusFilter = LogisticsRetreatStatus | "all";
type DestFilter = RetreatDestinationId | "all";

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export function LogisticsMainDashboard() {
  const hyperfocus = useUiStore((s) => s.hyperfocus);
  const upcoming = useMemo(() => listUpcomingRetreats(), []);
  const [view, setView] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [destFilter, setDestFilter] = useState<DestFilter>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [statusMap, setStatusMap] = useState<Map<string, LogisticsRetreatStatus>>(new Map());

  useEffect(() => {
    void (async () => {
      if (!db) return;
      const rows = await db.logisticsMeta.toArray();
      const m = new Map<string, LogisticsRetreatStatus>();
      for (const r of rows) m.set(r.retreatId, r.status);
      setStatusMap(m);
    })();
  }, []);

  const months = useMemo(() => {
    const s = new Set<string>();
    for (const r of upcoming) s.add(monthKey(r.startDate));
    return [...s].sort();
  }, [upcoming]);

  const filtered = useMemo(() => {
    return upcoming.filter((r) => {
      if (destFilter !== "all" && r.destination !== destFilter) return false;
      if (monthFilter !== "all" && monthKey(r.startDate) !== monthFilter) return false;
      const st = statusMap.get(r.id) ?? "preparation";
      if (statusFilter !== "all" && st !== statusFilter) return false;
      return true;
    });
  }, [upcoming, destFilter, monthFilter, statusFilter, statusMap]);

  const groupedByMonth = useMemo(() => {
    const g = new Map<string, RetreatDefinition[]>();
    for (const r of filtered) {
      const k = monthKey(r.startDate);
      const arr = g.get(k) ?? [];
      arr.push(r);
      g.set(k, arr);
    }
    return [...g.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className={cn("pb-16", hyperfocus && "space-y-6")}>
      <header className={cn("mb-8 space-y-4", hyperfocus && "mb-4 space-y-2")}>
        <p className="font-display text-xs uppercase tracking-[0.22em] text-padma-pearl dark:text-padma-lavender/90">
          Module 2 — opérations
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-cinzel text-3xl font-normal tracking-wide text-padma-night dark:text-padma-cream">Logistique</h1>
            <p className="mt-2 max-w-prose text-sm text-padma-night/78 dark:text-padma-cream/82">
              Vue calendrier &amp; liste des retraites à venir — planning, équipe, courses et check-lists restent disponibles hors ligne.
            </p>
          </div>
          <Button asChild variant="oracle" size="sm" className="font-cinzel rounded-full">
            <Link href="/reservation">Réserver · vitrine</Link>
          </Button>
        </div>
        <HyperfocusToolbar />
      </header>

      <div className={cn("mb-8 flex flex-wrap items-center gap-2", hyperfocus && "mb-4")}>
        <Button
          type="button"
          size="sm"
          variant={view === "list" ? "oracle" : "secondary"}
          className="rounded-full gap-2"
          onClick={() => setView("list")}
        >
          <LayoutList className="h-4 w-4" aria-hidden />
          Liste
        </Button>
        <Button
          type="button"
          size="sm"
          variant={view === "calendar" ? "oracle" : "secondary"}
          className="rounded-full gap-2"
          onClick={() => setView("calendar")}
        >
          <CalendarRange className="h-4 w-4" aria-hidden />
          Par mois
        </Button>
      </div>

      <div
        className={cn(
          "mb-8 grid gap-4 rounded-2xl border border-padma-pearl/35 bg-white/75 p-4 dark:border-padma-lavender/25 dark:bg-padma-night/45",
          hyperfocus && "mb-4 p-3",
          "print:hidden"
        )}
      >
        <p className="font-cinzel text-sm text-padma-night dark:text-padma-cream">Filtres</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col text-[0.65rem] uppercase tracking-wide text-padma-night/55 dark:text-padma-cream/55">
            Mois
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="mt-1 rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
            >
              <option value="all">Tous</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-[0.65rem] uppercase tracking-wide text-padma-night/55 dark:text-padma-cream/55">
            Destination
            <select
              value={destFilter}
              onChange={(e) => setDestFilter(e.target.value as DestFilter)}
              className="mt-1 rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
            >
              <option value="all">Toutes</option>
              <option value="france">France</option>
              <option value="portugal">Portugal</option>
              <option value="bretagne">Bretagne</option>
            </select>
          </label>
          <label className="flex flex-col text-[0.65rem] uppercase tracking-wide text-padma-night/55 dark:text-padma-cream/55">
            Statut logistique
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="mt-1 rounded-xl border border-padma-champagne/40 bg-white px-3 py-2 text-sm dark:border-padma-lavender/35 dark:bg-padma-night/60 dark:text-padma-cream"
            >
              <option value="all">Tous</option>
              <option value="preparation">Préparation</option>
              <option value="ready">Prêt · vert</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Complété</option>
            </select>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-padma-pearl/50 px-6 py-14 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-padma-champagne/70" aria-hidden />
          <p className="font-cinzel text-padma-night dark:text-padma-cream">Aucune retraite ne correspond.</p>
          <p className="mt-2 text-sm text-padma-night/60 dark:text-padma-cream/65">Élargis les filtres ou ajoute des réservations.</p>
        </div>
      ) : view === "list" ? (
        <ul className="flex flex-col gap-6">
          {filtered.map((r, i) => (
            <li key={r.id}>
              <LogisticsRetreatCard retreat={r} status={statusMap.get(r.id) ?? "preparation"} index={i} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-10">
          {groupedByMonth.map(([key, retreats]) => (
            <motion.section
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-padma-champagne/25 pb-2 dark:border-padma-lavender/20">
                <CalendarDays className="h-5 w-5 text-padma-lavender" aria-hidden />
                <h2 className="font-cinzel text-lg capitalize text-padma-night dark:text-padma-cream">{monthLabel(key)}</h2>
              </div>
              <ul className="flex flex-col gap-5">
                {retreats.map((r, i) => (
                  <li key={r.id}>
                    <LogisticsRetreatCard retreat={r} status={statusMap.get(r.id) ?? "preparation"} index={i} />
                  </li>
                ))}
              </ul>
            </motion.section>
          ))}
        </div>
      )}
    </div>
  );
}
