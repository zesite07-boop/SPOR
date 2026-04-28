"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { OracleSession } from "@/lib/db/schema";
import { deleteOracleSession, listOracleSessions } from "@/lib/oracle/session-persist";
import { Button } from "@/components/ui/button";
import { getMajorById } from "@/lib/oracle/tarot-major";

export function OracleHistoryPanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const [rows, setRows] = useState<OracleSession[]>([]);

  async function reload() {
    setRows(await listOracleSessions(300));
  }

  useEffect(() => {
    void reload();
  }, [refreshKey]);

  async function remove(id: string) {
    await deleteOracleSession(id);
    await reload();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-padma-night/72 dark:text-padma-cream/78">
        Historique complet des tirages du module Oracle — stocké uniquement dans ton navigateur (Dexie).
      </p>
      <ul className="space-y-3">
        {rows.length === 0 && (
          <li className="rounded-2xl border border-dashed border-padma-pearl/50 px-4 py-8 text-center text-sm text-padma-night/55 dark:text-padma-cream/55">
            Aucun tirage enregistré pour l’instant.
          </li>
        )}
        {rows.map((s) => (
          <motion.li
            key={s.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-padma-champagne/30 bg-white/75 p-4 dark:border-padma-lavender/25 dark:bg-padma-night/50"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-cinzel text-sm text-padma-night dark:text-padma-cream">{s.title}</p>
                <p className="text-xs text-padma-night/55 dark:text-padma-cream/55">
                  {new Date(s.drawnAt).toLocaleString("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-padma-night/45 hover:text-red-600 dark:text-padma-cream/45"
                aria-label="Supprimer ce tirage"
                onClick={() => void remove(s.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-padma-night/65 dark:text-padma-cream/70">
              {s.cardIds.map((id) => getMajorById(id).name).join(" · ")}
            </p>
            <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-padma-night/78 dark:text-padma-cream/82">{s.interpretation}</p>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
