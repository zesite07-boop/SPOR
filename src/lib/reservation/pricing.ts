import type { PaymentMode } from "@/lib/db/schema";
import type { PackageDays, RetreatDefinition } from "./catalog";

/** Supplément chambre solo (TTC / réservation). */
export const SOLO_ROOM_SURCHARGE_EUR = 180;

/** Transfert aéroport / gare (TTC / réservation). */
export const AIRPORT_TRANSFER_EUR = 95;

export type QuoteInput = {
  retreat: RetreatDefinition;
  packageDays: PackageDays;
  participants: number;
  soloRoom: boolean;
  airportTransfer: boolean;
  mode: PaymentMode;
};

export type QuoteResult = {
  packageLineEuro: number;
  soloEuro: number;
  transferEuro: number;
  subtotalEuro: number;
  /** Montant à payer maintenant (acompte ou total). */
  dueNowEuro: number;
  /** Solde restant si acompte (estimation). */
  balanceEuro: number;
  depositEuro: number;
  currency: "eur";
};

function packageForDays(r: RetreatDefinition, days: PackageDays) {
  const p = r.packages.find((x) => x.days === days);
  if (!p) throw new Error("Package inconnu");
  return p;
}

export function computeQuote(input: QuoteInput): QuoteResult {
  const { retreat, packageDays, participants, soloRoom, airportTransfer, mode } = input;
  const pkg = packageForDays(retreat, packageDays);
  const packageLineEuro = pkg.priceEuro * participants;
  const soloEuro = soloRoom ? SOLO_ROOM_SURCHARGE_EUR : 0;
  const transferEuro = airportTransfer ? AIRPORT_TRANSFER_EUR : 0;
  const subtotalEuro = packageLineEuro + soloEuro + transferEuro;
  /** Acompte package (catalogue) + 30 % des options (solo/transfert). */
  const packageDepositEuro = pkg.depositEuro * participants;
  const optionsEuro = soloEuro + transferEuro;
  const depositCombinedEuro = packageDepositEuro + Math.round(optionsEuro * 0.3);
  const dueNowEuro = mode === "deposit" ? depositCombinedEuro : subtotalEuro;
  const balanceEuro = mode === "deposit" ? Math.max(0, subtotalEuro - depositCombinedEuro) : 0;
  return {
    packageLineEuro,
    soloEuro,
    transferEuro,
    subtotalEuro,
    dueNowEuro,
    balanceEuro,
    depositEuro: depositCombinedEuro,
    currency: "eur",
  };
}

export function euroToCents(e: number): number {
  return Math.round(e * 100);
}
