import type { ReservationRecord } from "@/lib/db/schema";
import {
  getRetreatById,
  listUpcomingRetreats,
  type RetreatDestinationId,
  type RetreatEnergyId,
} from "@/lib/reservation/catalog";

export type TreasureKpis = {
  /** CA encaissé / réservations payées (€ TTC depuis totalCents). */
  caRealEuro: number;
  /** Encours hors payé : acomptes / checkout en cours (dueNow). */
  caPipelineEuro: number;
  participantCount: number;
  reservationCountPaid: number;
  /** Places pour retraites à venir dans le catalogue. */
  upcomingCapacity: number;
  /** Têtes réservées (payées) sur ces retraites uniquement. */
  headsUpcomingPaid: number;
  fillRatePercent: number;
  byDestination: {
    id: RetreatDestinationId;
    label: string;
    revenueEuro: number;
    bookings: number;
  }[];
  byPackageDays: { days: 3 | 5 | 7; revenueEuro: number; count: number }[];
  byEnergy: { id: RetreatEnergyId; label: string; revenueEuro: number }[];
};

export function computeTreasureKpis(reservations: ReservationRecord[]): TreasureKpis {
  const upcoming = listUpcomingRetreats();
  const upcomingIds = new Set(upcoming.map((u) => u.id));
  const upcomingCapacity = upcoming.reduce((s, u) => s + u.spotsTotal, 0);

  let caRealEuro = 0;
  let caPipelineEuro = 0;
  let participantCount = 0;
  let reservationCountPaid = 0;
  let headsUpcomingPaid = 0;

  const destAcc = new Map<
    RetreatDestinationId,
    { label: string; revenueEuro: number; bookings: number }
  >();
  const pkgAcc = new Map<3 | 5 | 7, { revenueEuro: number; count: number }>();
  const energyAcc = new Map<RetreatEnergyId, { label: string; revenueEuro: number }>();

  for (const row of reservations) {
    const euro = row.totalCents / 100;
    const retreat = getRetreatById(row.retreatId);

    if (row.status === "paid") {
      reservationCountPaid += 1;
      participantCount += row.participants;

      caRealEuro += euro;

      if (retreat && upcomingIds.has(row.retreatId)) {
        headsUpcomingPaid += row.participants;
      }

      if (retreat) {
        const dc =
          destAcc.get(retreat.destination) ?? {
            label: retreat.destinationLabel,
            revenueEuro: 0,
            bookings: 0,
          };
        destAcc.set(retreat.destination, {
          label: retreat.destinationLabel,
          revenueEuro: dc.revenueEuro + euro,
          bookings: dc.bookings + 1,
        });

        const pk = row.packageDays;
        const pc = pkgAcc.get(pk) ?? { revenueEuro: 0, count: 0 };
        pkgAcc.set(pk, {
          revenueEuro: pc.revenueEuro + euro,
          count: pc.count + 1,
        });

        const ec =
          energyAcc.get(retreat.energy) ?? {
            label: retreat.energyLabel,
            revenueEuro: 0,
          };
        energyAcc.set(retreat.energy, {
          label: retreat.energyLabel,
          revenueEuro: ec.revenueEuro + euro,
        });
      }
    }

    if (
      row.status !== "cancelled" &&
      row.status !== "draft" &&
      row.status !== "paid"
    ) {
      caPipelineEuro += row.dueNowCents / 100;
    }
  }

  const fillRatePercent =
    upcomingCapacity > 0
      ? Math.min(100, Math.round((headsUpcomingPaid / upcomingCapacity) * 1000) / 10)
      : 0;

  const byDestination = [...destAcc.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.revenueEuro - a.revenueEuro);

  const byPackageDays = [...pkgAcc.entries()]
    .map(([days, v]) => ({ days, ...v }))
    .sort((a, b) => b.revenueEuro - a.revenueEuro);

  const byEnergy = [...energyAcc.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.revenueEuro - a.revenueEuro);

  return {
    caRealEuro,
    caPipelineEuro,
    participantCount,
    reservationCountPaid,
    upcomingCapacity,
    headsUpcomingPaid,
    fillRatePercent,
    byDestination,
    byPackageDays,
    byEnergy,
  };
}
