/** Catalogue des retraites Serey Padma — données locales (offline-first), alignées serveur pour Stripe. */

export type RetreatDestinationId = "france" | "portugal" | "bretagne";

export type RetreatEnergyId = "eau-lunaire" | "feu-doux" | "ancrage" | "ether";

export type PackageDays = 3 | 5 | 7;

export type RetreatPackageDef = {
  days: PackageDays;
  label: string;
  /** Prix TTC par personne (EUR). */
  priceEuro: number;
  /** Acompte suggéré (EUR) ~30 %. */
  depositEuro: number;
  nights: number;
  highlights: string[];
};

export type RetreatDefinition = {
  id: string;
  title: string;
  subtitle: string;
  /** Début inclus (YYYY-MM-DD). */
  startDate: string;
  /** Fin inclus (YYYY-MM-DD). */
  endDate: string;
  destination: RetreatDestinationId;
  destinationLabel: string;
  /** Tag court pour filtres « énergie ». */
  energy: RetreatEnergyId;
  energyLabel: string;
  astroTheme: string;
  numeroTheme: string;
  spotsTotal: number;
  spotsLeft: number;
  packages: RetreatPackageDef[];
  /** Toujours inclus quel que soit le package. */
  includedEverywhere: string[];
};

export function retreatSlug(retreat: RetreatDefinition): string {
  const base = `${retreat.title}-${retreat.destinationLabel}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base}-${retreat.id}`;
}

export const DESTINATION_OPTIONS: { id: RetreatDestinationId | "all"; label: string }[] = [
  { id: "all", label: "Toutes destinations" },
  { id: "france", label: "France" },
  { id: "portugal", label: "Portugal" },
  { id: "bretagne", label: "Bretagne" },
];

export const ENERGY_OPTIONS: { id: RetreatEnergyId | "all"; label: string }[] = [
  { id: "all", label: "Toutes les énergies" },
  { id: "eau-lunaire", label: "Eau & lune" },
  { id: "feu-doux", label: "Feu doux" },
  { id: "ancrage", label: "Ancrage terre" },
  { id: "ether", label: "Éther & couronne" },
];

export const DURATION_OPTIONS: { days: PackageDays | "all"; label: string }[] = [
  { days: "all", label: "Toutes durées" },
  { days: 3, label: "3 jours" },
  { days: 5, label: "5 jours" },
  { days: 7, label: "7 jours" },
];

const INCLUDED_STANDARD = [
  "Hébergement partagé ou en duo (selon formule)",
  "Repas végétariens lumineux & tisanes du jardin",
  "Méditations guidées & cercles oracle quotidiens",
  "Soins Reiki groupe & temps de silence habité",
  "Kit « continuation » numérique (audio + PDF)",
];

export const RETREAT_CATALOG: RetreatDefinition[] = [
  {
    id: "padma-huile-lunaire",
    title: "Huile de lune — Bretagne",
    subtitle: "Marées, silence et oracle au bord de l’eau.",
    startDate: "2026-06-11",
    endDate: "2026-06-17",
    destination: "bretagne",
    destinationLabel: "Bretagne · littoral",
    energy: "eau-lunaire",
    energyLabel: "Eau & lune",
    astroTheme: "Solstice · Cancer naissant — ouvrir la maison intérieure.",
    numeroTheme: "Chemin 6 — harmonie du foyer et du cœur.",
    spotsTotal: 14,
    spotsLeft: 6,
    packages: [
      {
        days: 3,
        label: "Essentiel 3 jours",
        priceEuro: 920,
        depositEuro: 280,
        nights: 2,
        highlights: ["Corps sensible & eau", "Cercle oracle du soir"],
      },
      {
        days: 5,
        label: "Immersion 5 jours",
        priceEuro: 1540,
        depositEuro: 470,
        nights: 4,
        highlights: ["Reiki sensoriel", "Cartographie chakra + mer"],
      },
      {
        days: 7,
        label: "Cycle complet 7 jours",
        priceEuro: 2180,
        depositEuro: 660,
        nights: 6,
        highlights: ["Rituel nouvelle lune", "Journal oracle accompagné"],
      },
    ],
    includedEverywhere: INCLUDED_STANDARD,
  },
  {
    id: "padma-sintra-ether",
    title: "Couronnes de brume — Sintra",
    subtitle: "Forêt, pierre et souffle éthéré au Portugal.",
    startDate: "2026-09-04",
    endDate: "2026-09-12",
    destination: "portugal",
    destinationLabel: "Portugal · Sintra",
    energy: "ether",
    energyLabel: "Éther & couronne",
    astroTheme: "Vierge solaire · Mercure rétro possible — réécriture douce.",
    numeroTheme: "Chemin 7 — quête intérieure et langage du symbole.",
    spotsTotal: 12,
    spotsLeft: 4,
    packages: [
      {
        days: 3,
        label: "Essentiel 3 jours",
        priceEuro: 1080,
        depositEuro: 330,
        nights: 2,
        highlights: ["Temples & marches lentes", "Oracle du matin"],
      },
      {
        days: 5,
        label: "Immersion 5 jours",
        priceEuro: 1780,
        depositEuro: 540,
        nights: 4,
        highlights: ["Cartes & pierres", "Voix & gorge sacrée"],
      },
      {
        days: 7,
        label: "Cycle complet 7 jours",
        priceEuro: 2460,
        depositEuro: 740,
        nights: 6,
        highlights: ["Veillée chemin de vie", "Intégration Reiki 1er degré toucher"],
      },
    ],
    includedEverywhere: INCLUDED_STANDARD,
  },
  {
    id: "padma-luberon-ancrage",
    title: "Racines de lumière — Luberon",
    subtitle: "Terre ocre, cuisine sacrée et ancrage du plexus.",
    startDate: "2026-05-07",
    endDate: "2026-05-13",
    destination: "france",
    destinationLabel: "France · Luberon",
    energy: "ancrage",
    energyLabel: "Ancrage terre",
    astroTheme: "Taureau en pleine floraison — honorer les sens.",
    numeroTheme: "Chemin 4 — temple du corps et du rythme.",
    spotsTotal: 16,
    spotsLeft: 9,
    packages: [
      {
        days: 3,
        label: "Essentiel 3 jours",
        priceEuro: 980,
        depositEuro: 300,
        nights: 2,
        highlights: ["Atelier cuisine sacrée", "Marche méditative"],
      },
      {
        days: 5,
        label: "Immersion 5 jours",
        priceEuro: 1620,
        depositEuro: 490,
        nights: 4,
        highlights: ["Feu du cercle", "Oracle du corps"],
      },
      {
        days: 7,
        label: "Cycle complet 7 jours",
        priceEuro: 2280,
        depositEuro: 690,
        nights: 6,
        highlights: ["Préparation retraite silencieuse", "Massage sonore"],
      },
    ],
    includedEverywhere: INCLUDED_STANDARD,
  },
  {
    id: "padma-douro-feu",
    title: "Rivière couleur miel — Douro",
    subtitle: "Vignes, chaleur douce et vitalité créatrice.",
    startDate: "2026-10-15",
    endDate: "2026-10-21",
    destination: "portugal",
    destinationLabel: "Portugal · Vallée du Douro",
    energy: "feu-doux",
    energyLabel: "Feu doux",
    astroTheme: "Balance · équilibre des dons et des limites.",
    numeroTheme: "Chemin 3 — joie partagée et expression juste.",
    spotsTotal: 10,
    spotsLeft: 3,
    packages: [
      {
        days: 3,
        label: "Essentiel 3 jours",
        priceEuro: 990,
        depositEuro: 300,
        nights: 2,
        highlights: ["Feu sacré sans excès", "Danse douce au coucher du soleil"],
      },
      {
        days: 5,
        label: "Immersion 5 jours",
        priceEuro: 1680,
        depositEuro: 510,
        nights: 4,
        highlights: ["Cercle voix", "Créativité & oracle"],
      },
      {
        days: 7,
        label: "Cycle complet 7 jours",
        priceEuro: 2320,
        depositEuro: 700,
        nights: 6,
        highlights: ["Alignement créatif", "Projet de vie doux"],
      },
    ],
    includedEverywhere: INCLUDED_STANDARD,
  },
];

export function getRetreatById(id: string): RetreatDefinition | undefined {
  return RETREAT_CATALOG.find((r) => r.id === id);
}

export function getRetreatByPublicSlug(slug: string): RetreatDefinition | undefined {
  return RETREAT_CATALOG.find((r) => retreatSlug(r) === slug);
}

export function listUpcomingRetreats(now = new Date()): RetreatDefinition[] {
  const t = now.getTime();
  return RETREAT_CATALOG.filter((r) => new Date(r.endDate + "T23:59:59").getTime() >= t).sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}
