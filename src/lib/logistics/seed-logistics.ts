import type { RetreatDefinition } from "@/lib/reservation/catalog";
import { db } from "@/lib/db/schema";
import type { LogisticsParticipant, LogisticsRetreatMeta, LogisticsRetreatStatus, LogisticsTask } from "@/lib/db/schema";
import { buildPlanningSeeds, countDaysInclusive, defaultChecklistSeeds } from "./default-planning";

function uid() {
  return crypto.randomUUID();
}

export async function ensureLogisticsMeta(retreatId: string, status: LogisticsRetreatStatus = "preparation") {
  if (!db) return;
  const existing = await db.logisticsMeta.get(retreatId);
  if (existing) return;
  const row: LogisticsRetreatMeta = {
    retreatId,
    status,
    updatedAt: Date.now(),
  };
  await db.logisticsMeta.put(row);
}

export async function seedTasksIfEmpty(retreat: RetreatDefinition) {
  if (!db) return;
  const count = await db.logisticsTasks.where("retreatId").equals(retreat.id).count();
  if (count > 0) return;

  const planning = buildPlanningSeeds(retreat.startDate, retreat.endDate);
  const check = defaultChecklistSeeds();
  const seeds = [...planning, ...check];
  const now = Date.now();

  await db.logisticsTasks.bulkAdd(
    seeds.map(
      (s, i) =>
        ({
          id: uid(),
          retreatId: retreat.id,
          section: s.section,
          dayIndex: s.dayIndex,
          slot: s.slot,
          label: s.label,
          done: false,
          sortOrder: s.sortOrder ?? i,
          updatedAt: now,
        }) satisfies LogisticsTask
    )
  );

  const grocerySeeds = [
    { label: "Valider liste générée (onglet Courses) avec producteur·rice locale", sortOrder: 0 },
    { label: "Commander pain / alternatives sans gluten si besoin", sortOrder: 1 },
    { label: "Prévoir glacières & conservation douce", sortOrder: 2 },
  ];
  let o = 0;
  for (const g of grocerySeeds) {
    await db.logisticsTasks.add({
      id: uid(),
      retreatId: retreat.id,
      section: "groceries",
      dayIndex: null,
      label: g.label,
      done: false,
      sortOrder: 100 + o++,
      updatedAt: now,
    });
  }
}

/** Synchronise les réservations Dexie vers participantes logistique (id stable par réservation). */
export async function syncParticipantsFromReservations(retreat: RetreatDefinition) {
  if (!db) return;
  const rows = await db.reservations.where("retreatId").equals(retreat.id).toArray();
  const now = Date.now();
  for (const r of rows) {
    const id = `res-${r.id}`;
    const name = r.contactEmail.includes("@") ? r.contactEmail.split("@")[0]!.replace(/\./g, " ") : "Participante";
    const row: LogisticsParticipant = {
      id,
      retreatId: retreat.id,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      partySize: r.participants,
      allergies: r.allergies,
      intentions: r.intentions,
      birthDate: r.birthDate,
      oracleNote: r.intentions ? `Intention déclarée à la réservation.` : undefined,
      roomLabel: r.soloRoom ? "Solo (confirmé)" : "À attribuer",
      transferStatus: r.airportTransfer ? "Transfert demandé" : "—",
      sortOrder: r.createdAt,
      updatedAt: now,
      sourceReservationId: r.id,
    };
    await db.logisticsParticipants.put(row);
  }

  const n = await db.logisticsParticipants.where("retreatId").equals(retreat.id).count();
  if (n === 0) {
    await db.logisticsParticipants.add({
      id: `demo-${retreat.id}-1`,
      retreatId: retreat.id,
      name: "Cercle en attente",
      partySize: 1,
      allergies: "",
      intentions: "Ajoute des réservations ou saisis une participante manuellement.",
      roomLabel: "—",
      transferStatus: "—",
      sortOrder: 0,
      updatedAt: now,
    });
  }
}

export async function ensureRetreatLogistics(retreat: RetreatDefinition) {
  await ensureLogisticsMeta(retreat.id);
  await seedTasksIfEmpty(retreat);
  await syncParticipantsFromReservations(retreat);
}

export function totalPersonDays(participants: { partySize: number }[], retreat: RetreatDefinition): number {
  const heads = participants.reduce((a, p) => a + Math.max(1, p.partySize), 0);
  const days = countDaysInclusive(retreat.startDate, retreat.endDate);
  return Math.max(1, heads * days);
}
