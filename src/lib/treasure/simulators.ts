import { countDaysInclusive } from "@/lib/logistics/default-planning";
import type { RetreatDefinition } from "@/lib/reservation/catalog";

export type MarginInput = {
  revenueEuro: number;
  participantCount: number;
  retreatDays: number;
  variableCostPerParticipantDayEuro: number;
  retreatFixedOverheadEuro: number;
};

/** Marge après coûts variables + enveloppe fixe par retraite. */
export function simulateMargin(input: MarginInput): {
  variableTotal: number;
  marginEuro: number;
  marginPercent: number;
} {
  const variableTotal =
    input.participantCount *
    input.retreatDays *
    input.variableCostPerParticipantDayEuro;
  const totalCosts = variableTotal + input.retreatFixedOverheadEuro;
  const marginEuro = input.revenueEuro - totalCosts;
  const marginPercent =
    input.revenueEuro > 0 ? (marginEuro / input.revenueEuro) * 100 : 0;
  return {
    variableTotal,
    marginEuro,
    marginPercent,
  };
}

export type BreakEvenInput = {
  /** Prix moyen par tête TTC facturé (€). */
  avgPricePerHeadEuro: number;
  /** Coût variable par tête et par jour. */
  variableCostPerParticipantDayEuro: number;
  /** Durée retraite en jours (inclus). */
  retreatDays: number;
  /** Charges fixes mensuelles à absorber (€). */
  monthlyFixedCostsEuro: number;
  /** Part des fixes imputée au scénario (1 = tout le mois sur cette ligne). */
  monthlyFixedShare: number;
  retreatFixedOverheadEuro: number;
};

/** Nombre de participantes nécessaires pour couvrir les charges du scénario (approximation). */
export function simulateBreakEvenParticipants(input: BreakEvenInput): {
  contributionPerHead: number;
  participantsNeeded: number;
} {
  const varPerHead =
    input.variableCostPerParticipantDayEuro * input.retreatDays;
  const contributionPerHead = input.avgPricePerHeadEuro - varPerHead;
  const fixedLoad =
    input.monthlyFixedCostsEuro * input.monthlyFixedShare +
    input.retreatFixedOverheadEuro;
  if (contributionPerHead <= 0) {
    return { contributionPerHead, participantsNeeded: Infinity };
  }
  const participantsNeeded = Math.ceil(fixedLoad / contributionPerHead);
  return { contributionPerHead, participantsNeeded };
}

export type ScenarioExtraRetreatInput = {
  template: RetreatDefinition;
  /** Panier moyen (prix catalogue du package choisi). */
  assumedAvgPriceEuro: number;
  spotsTotal: number;
  /** Parts remplies au scénario (0–1). */
  fillRatio: number;
};

/** CA additionnel si une retraite « clone » du template est ajoutée. */
export function simulateExtraRetreatScenario(input: ScenarioExtraRetreatInput): {
  retreatDays: number;
  projectedRevenueEuro: number;
  projectedHeads: number;
} {
  const retreatDays = countDaysInclusive(
    input.template.startDate,
    input.template.endDate
  );
  const projectedHeads = Math.round(input.spotsTotal * input.fillRatio);
  const projectedRevenueEuro = projectedHeads * input.assumedAvgPriceEuro;
  return { retreatDays, projectedRevenueEuro, projectedHeads };
}

export type MicroFiscalInput = {
  /** CA TTC annuel déclaré (€). */
  grossRevenueTtcEuro: number;
  /** Abattement forfaitaire BIC / BNC — défaut 34 % (services) variante courante ; personnalisable. */
  allowanceRate: number;
  /** Cotisations sociales sur CA (taux micro social simplifié). */
  socialRateOnCa: number;
};

/**
 * Simulation très simplifiée à titre pédagogique — ne remplace pas un expert-comptable.
 * Base imposable ≈ CA × (1 - abattement) ; charges sociales sur CA ; IR non simulé ici.
 */
export function simulateMicroFiscalSnapshot(input: MicroFiscalInput): {
  baseImposableApproxEuro: number;
  socialChargesApproxEuro: number;
  netAfterSocialApproxEuro: number;
} {
  const revenue = Math.max(0, input.grossRevenueTtcEuro);
  const baseImposableApproxEuro = revenue * (1 - input.allowanceRate);
  const socialChargesApproxEuro = revenue * input.socialRateOnCa;
  const netAfterSocialApproxEuro = revenue - socialChargesApproxEuro;
  return {
    baseImposableApproxEuro,
    socialChargesApproxEuro,
    netAfterSocialApproxEuro,
  };
}
