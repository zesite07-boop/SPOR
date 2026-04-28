import type { MoonPhaseKind } from "./lunar";

/** Suggestions de thèmes de retraites / ateliers selon l’énergie du moment (heuristique locale). */

const BY_MOON: Partial<Record<MoonPhaseKind, string[]>> = {
  new: [
    "Retraite « Graine de lumière » — intentions & vision board sacré",
    "Atelier silence & respiration : poser un motif pour les 29 jours",
  ],
  waxing_crescent: [
    "Immersion douce « Premier croissant » — nutrition lumineuse & marche consciente",
    "Cercle Reiki express : réveiller la vitalité sans forcer",
  ],
  first_quarter: [
    "Week-end « Premier quartier » — dépasser un blocage avec douceur (corps + parole)",
    "Atelier créatif : donner forme à ce qui monte en toi",
  ],
  waxing_gibbous: [
    "Stage « Gibbeuse croissante » — affiner ton projet avant la pleine lune",
    "Yoga doux & journaling : ajuster le tir sans te presser",
  ],
  full: [
    "Retraite « Pleine lune » — gratitude, partage et lâcher-prise célébré",
    "Rituel sonore & bain de lumière : honorer ce qui est accompli",
  ],
  waning_gibbous: [
    "Atelier intégration « Gibbeuse décroissante » — tri émotionnel bienveillant",
    "Cuisine sacrée : recycler l’énergie, alléger l’assiette et l’esprit",
  ],
  last_quarter: [
    "« Dernier quartier » — lâcher les attentes, réorganiser l’espace intérieur",
    "Massage/Reiki partagé : gratitude aux corps qui portent tes apprentissages",
  ],
  waning_crescent: [
    "Retraite « Dernier croissant » — sommeil sacré, rêves et préparation au noir lumineux",
    "Méditation allongée & bains : se fondre avant le recommencement",
  ],
};

const BY_SUN: Record<string, string[]> = {
  Bélier: ["Feu du début : leadership bienveillant & mouvement", "Atelier courage doux : oser sans brusquer"],
  Taureau: ["Plaisir des sens : ancrage, terre & matières nobles", "Retraite culinary slow & soin du foyer"],
  Gémeaux: ["Voix & écriture : cercle de parole authentique", "Curiosité : yoga du rire + exploration locale"],
  Cancer: ["Sanctuaire intérieur : eau, berceau, mémoire douce", "Retraite « nid » : famille choisie & protection"],
  Lion: ["Rayonner sans brûler : créativité & cœur ouvert", "Danse, chant, expression du trône intérieur"],
  Vierge: ["Précision aimante : rituels de soin & purification", "Herboristerie douce & rangement sacré"],
  Balance: ["Alliance & beauté : dyades, esthétique, diplomatie du cœur", "Atelier relationnel & art floral"],
  Scorpion: ["Profondeur : transformation douce, secrets bien gardés", "Bain de conscience & libération émotionnelle"],
  Sagittaire: ["Horizon : voyage intérieur, philosophie & foi", "Retraite nature & sentiers de vérité"],
  Capricorne: ["Structure lumineuse : ambition douce & montée responsable", "Alignement carrière / âme sans sécheresse"],
  Verseau: ["Cercle humain : innovation utile & vision collective", "Atelier futur souhaitable & communauté"],
  Poissons: ["Dissolution douce : rêve, musique, compassion", "Retraite eau & silence : fusion avec l’invisible"],
};

export function suggestRetreatThemes(moonPhase: MoonPhaseKind, sunSign: string): string[] {
  const moonIdeas = BY_MOON[moonPhase] ?? BY_MOON.waxing_crescent!;
  const sunIdeas = BY_SUN[sunSign] ?? BY_SUN["Poissons"];
  return [moonIdeas[0], sunIdeas[0], moonIdeas[1] ?? sunIdeas[1]].filter(Boolean);
}
