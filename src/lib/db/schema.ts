import Dexie, { type EntityTable } from "dexie";

/** Logistique retraite — planning, check-lists, participantes. */
export type LogisticsRetreatStatus = "preparation" | "ready" | "in_progress" | "completed";

export type LogisticsTaskSection = "planning" | "material" | "groceries" | "transport";

export interface LogisticsRetreatMeta {
  retreatId: string;
  status: LogisticsRetreatStatus;
  updatedAt: number;
}

export interface LogisticsTask {
  id: string;
  retreatId: string;
  section: LogisticsTaskSection;
  /** Index jour (0 = premier jour) ; null pour check-lists globales. */
  dayIndex: number | null;
  slot?: string;
  label: string;
  done: boolean;
  sortOrder: number;
  updatedAt: number;
}

export interface LogisticsParticipant {
  id: string;
  retreatId: string;
  name: string;
  /** Personnes représentées (réservation groupe). */
  partySize: number;
  allergies?: string;
  intentions?: string;
  birthDate?: string;
  oracleNote?: string;
  roomLabel?: string;
  transferStatus?: string;
  sourceReservationId?: string;
  sortOrder: number;
  updatedAt: number;
}

/** Profil utilisateur minimal — synchronisable plus tard avec Supabase */
export interface OasisProfile {
  id: string;
  email?: string;
  displayName?: string;
  /** ISO date YYYY-MM-DD */
  birthDate?: string;
  /** Prénom + nom pour nombre d’âme */
  fullName?: string;
  /** Notes « avant retraite » / « après retraite » — évolution du portrait oracle */
  oracleEvolutionBefore?: string;
  oracleEvolutionAfter?: string;
  updatedAt: number;
}

/** Événements locaux (retraites, rappels) — offline-first */
export interface OasisEvent {
  id: string;
  title: string;
  startAt: number;
  cosmicNote?: string;
  updatedAt: number;
}

/** File de sync vers le cloud */
export interface SyncQueueItem {
  id: string;
  payload: Record<string, unknown>;
  createdAt: number;
}

/** Tirage oracle du jour (3 arcanes) — historique local 7 jours. */
export interface OracleDayDraw {
  /** Clé `YYYY-MM-DD` — un tirage par jour ; un nouveau tirage remplace celui du jour courant. */
  id: string;
  cardIds: [number, number, number];
  interpretation: string;
  drawnAt: number;
}

export type PaymentMode = "full" | "deposit";

/** Réservation retraite — Dexie offline + sync Stripe / Supabase ultérieure. */
export interface ReservationRecord {
  id: string;
  retreatId: string;
  packageDays: 3 | 5 | 7;
  participants: number;
  soloRoom: boolean;
  airportTransfer: boolean;
  allergies?: string;
  intentions?: string;
  birthDate?: string;
  contactEmail: string;
  paymentMode: PaymentMode;
  /** Montant total séjour TTC (centimes). */
  totalCents: number;
  /** Montant payé à l’instant (acompte ou total). */
  dueNowCents: number;
  currency: string;
  stripeCheckoutSessionId?: string;
  status: "draft" | "checkout_pending" | "checkout_created" | "paid" | "cancelled";
  createdAt: number;
  updatedAt: number;
}

/** Tableau de bord Trésor — ordre des widgets (drag & drop). */
export interface TreasureWidgetLayout {
  id: string;
  widgetOrder: string[];
  updatedAt: number;
}

/** Hypothèses simulateurs freelance (persistées localement). */
export interface TreasureSimulatorSettings {
  id: string;
  /** Charges fixes mensuelles (€). */
  monthlyFixedCostsEuro: number;
  /** Coût variable par participante et par jour (€). */
  variableCostPerParticipantDayEuro: number;
  /** Frais fixes attribués à une retraite (€). */
  retreatFixedOverheadEuro: number;
  /** Taux global cotisations / charges sur CA (micro) 0–1 — valeur indicative. */
  microContributionRate: number;
  updatedAt: number;
}

/** Gamification dashboard (points + badges débloqués). */
export interface TreasureGamificationState {
  id: string;
  energyPoints: number;
  badges: string[];
  updatedAt: number;
}

/** Formats export contenus marketing (studio Rayonner). */
export type MarketingFormat = "reel_60" | "story" | "carousel" | "feed_post" | "email";

/** Scénarios éditoriaux — alignés parcours & oracle. */
export type MarketingScenario =
  | "before_retreat"
  | "during_retreat"
  | "after_retreat"
  | "daily_draw"
  | "referral"
  | "announcement";

/** File de posts / idées à publier — checklist locale. */
export interface MarketingQueueItem {
  id: string;
  label: string;
  formatHint?: MarketingFormat;
  scenarioTag?: MarketingScenario;
  /** Date suggérée affichée (YYYY-MM-DD). */
  suggestedDate?: string;
  done: boolean;
  sortOrder: number;
  updatedAt: number;
}

/** Préférences générateur (dernier format / scénario). */
export interface MarketingPrefs {
  id: string;
  lastFormat: MarketingFormat;
  lastScenario: MarketingScenario;
  updatedAt: number;
}

export type ReminderType = "retreat_j_minus_7" | "balance_j_minus_14" | "retreat_j_plus_3";

export interface ReminderNotification {
  id: string;
  type: ReminderType;
  retreatId: string;
  participantId?: string;
  scheduledAt: number;
  title: string;
  body: string;
  firedAt?: number;
  updatedAt: number;
}

export interface NotificationPrefs {
  id: string;
  enabled: boolean;
  askedOnboarding: boolean;
  permission: "default" | "granted" | "denied";
  updatedAt: number;
}

export interface TwoFactorConfig {
  id: string;
  secretEncrypted: string;
  issuer: string;
  accountLabel: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TwoFactorSession {
  id: string;
  verifiedAt: number;
  expiresAt: number;
  updatedAt: number;
}

export type OracleSessionDrawType =
  | "chakra_full"
  | "chakra_focus"
  | "life_path"
  | "monthly"
  | "retreat"
  | "free";

/** Session oracle complète — module /oracle (historique illimité local). */
export interface OracleSession {
  id: string;
  drawType: OracleSessionDrawType;
  title: string;
  cardIds: number[];
  positionLabels?: string[];
  interpretation: string;
  meta?: Record<string, unknown>;
  drawnAt: number;
}

export class OasisDB extends Dexie {
  profiles!: EntityTable<OasisProfile, "id">;
  events!: EntityTable<OasisEvent, "id">;
  syncQueue!: EntityTable<SyncQueueItem, "id">;
  oracleDraws!: EntityTable<OracleDayDraw, "id">;
  oracleSessions!: EntityTable<OracleSession, "id">;
  reservations!: EntityTable<ReservationRecord, "id">;
  logisticsMeta!: EntityTable<LogisticsRetreatMeta, "retreatId">;
  logisticsTasks!: EntityTable<LogisticsTask, "id">;
  logisticsParticipants!: EntityTable<LogisticsParticipant, "id">;
  treasureWidgetLayout!: EntityTable<TreasureWidgetLayout, "id">;
  treasureSimulatorSettings!: EntityTable<TreasureSimulatorSettings, "id">;
  treasureGamification!: EntityTable<TreasureGamificationState, "id">;
  marketingQueue!: EntityTable<MarketingQueueItem, "id">;
  marketingPrefs!: EntityTable<MarketingPrefs, "id">;
  reminderNotifications!: EntityTable<ReminderNotification, "id">;
  notificationPrefs!: EntityTable<NotificationPrefs, "id">;
  twoFactorConfig!: EntityTable<TwoFactorConfig, "id">;
  twoFactorSession!: EntityTable<TwoFactorSession, "id">;

  constructor() {
    super("oasis-oracle-reiki");
    this.version(1).stores({
      profiles: "id, email, updatedAt",
      events: "id, startAt, updatedAt",
      syncQueue: "id, createdAt",
    });
    this.version(2).stores({
      profiles: "id, email, updatedAt",
      events: "id, startAt, updatedAt",
      syncQueue: "id, createdAt",
      oracleDraws: "id, drawnAt",
    });
    this.version(3).stores({
      profiles: "id, email, updatedAt",
      events: "id, startAt, updatedAt",
      syncQueue: "id, createdAt",
      oracleDraws: "id, drawnAt",
      oracleSessions: "id, drawnAt, drawType",
    });
    this.version(4).stores({
      profiles: "id, email, updatedAt",
      events: "id, startAt, updatedAt",
      syncQueue: "id, createdAt",
      oracleDraws: "id, drawnAt",
      oracleSessions: "id, drawnAt, drawType",
      reservations: "id, createdAt, retreatId, status",
    });
    this.version(5).stores({
      profiles: "id, email, updatedAt",
      events: "id, startAt, updatedAt",
      syncQueue: "id, createdAt",
      oracleDraws: "id, drawnAt",
      oracleSessions: "id, drawnAt, drawType",
      reservations: "id, createdAt, retreatId, status",
      logisticsMeta: "retreatId, status, updatedAt",
      logisticsTasks: "id, retreatId, section, dayIndex, sortOrder, updatedAt",
      logisticsParticipants: "id, retreatId, sortOrder, updatedAt",
    });
    this.version(6).stores({
      profiles: "id, email, updatedAt",
      events: "id, startAt, updatedAt",
      syncQueue: "id, createdAt",
      oracleDraws: "id, drawnAt",
      oracleSessions: "id, drawnAt, drawType",
      reservations: "id, createdAt, retreatId, status",
      logisticsMeta: "retreatId, status, updatedAt",
      logisticsTasks: "id, retreatId, section, dayIndex, sortOrder, updatedAt",
      logisticsParticipants: "id, retreatId, sortOrder, updatedAt",
      treasureWidgetLayout: "id, updatedAt",
      treasureSimulatorSettings: "id, updatedAt",
      treasureGamification: "id, updatedAt",
    });
    this.version(7).stores({
      profiles: "id, email, updatedAt",
      events: "id, startAt, updatedAt",
      syncQueue: "id, createdAt",
      oracleDraws: "id, drawnAt",
      oracleSessions: "id, drawnAt, drawType",
      reservations: "id, createdAt, retreatId, status",
      logisticsMeta: "retreatId, status, updatedAt",
      logisticsTasks: "id, retreatId, section, dayIndex, sortOrder, updatedAt",
      logisticsParticipants: "id, retreatId, sortOrder, updatedAt",
      treasureWidgetLayout: "id, updatedAt",
      treasureSimulatorSettings: "id, updatedAt",
      treasureGamification: "id, updatedAt",
      marketingQueue: "id, done, sortOrder, updatedAt",
      marketingPrefs: "id, updatedAt",
    });
    this.version(8).stores({
      profiles: "id, email, updatedAt",
      events: "id, startAt, updatedAt",
      syncQueue: "id, createdAt",
      oracleDraws: "id, drawnAt",
      oracleSessions: "id, drawnAt, drawType",
      reservations: "id, createdAt, retreatId, status",
      logisticsMeta: "retreatId, status, updatedAt",
      logisticsTasks: "id, retreatId, section, dayIndex, sortOrder, updatedAt",
      logisticsParticipants: "id, retreatId, sortOrder, updatedAt",
      treasureWidgetLayout: "id, updatedAt",
      treasureSimulatorSettings: "id, updatedAt",
      treasureGamification: "id, updatedAt",
      marketingQueue: "id, done, sortOrder, updatedAt",
      marketingPrefs: "id, updatedAt",
      reminderNotifications: "id, scheduledAt, retreatId, participantId, firedAt, updatedAt",
      notificationPrefs: "id, updatedAt",
    });
    this.version(9).stores({
      profiles: "id, email, updatedAt",
      events: "id, startAt, updatedAt",
      syncQueue: "id, createdAt",
      oracleDraws: "id, drawnAt",
      oracleSessions: "id, drawnAt, drawType",
      reservations: "id, createdAt, retreatId, status",
      logisticsMeta: "retreatId, status, updatedAt",
      logisticsTasks: "id, retreatId, section, dayIndex, sortOrder, updatedAt",
      logisticsParticipants: "id, retreatId, sortOrder, updatedAt",
      treasureWidgetLayout: "id, updatedAt",
      treasureSimulatorSettings: "id, updatedAt",
      treasureGamification: "id, updatedAt",
      marketingQueue: "id, done, sortOrder, updatedAt",
      marketingPrefs: "id, updatedAt",
      reminderNotifications: "id, scheduledAt, retreatId, participantId, firedAt, updatedAt",
      notificationPrefs: "id, updatedAt",
      twoFactorConfig: "id, enabled, updatedAt",
      twoFactorSession: "id, expiresAt, updatedAt",
    });
  }
}

export const db = typeof window !== "undefined" ? new OasisDB() : null;
