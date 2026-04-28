import type { MarketingFormat, MarketingScenario } from "@/lib/db/schema";

export const FORMAT_OPTIONS: {
  id: MarketingFormat;
  label: string;
  hint: string;
}[] = [
  { id: "reel_60", label: "Reel 60 s", hint: "Structure temps + accroche / corps / CTA" },
  { id: "story", label: "Story", hint: "Courtes lignes pour vertical" },
  { id: "carousel", label: "Carrousel", hint: "Slides numérotées dans le texte" },
  { id: "feed_post", label: "Post feed", hint: "Légende + hashtags" },
  { id: "email", label: "Email", hint: "Objet + corps lettre douce" },
];

export const SCENARIO_OPTIONS: {
  id: MarketingScenario;
  label: string;
  hint: string;
}[] = [
  { id: "before_retreat", label: "Avant retraite", hint: "Teaser & intention" },
  { id: "during_retreat", label: "Pendant", hint: "Présence & cercle" },
  { id: "after_retreat", label: "Après", hint: "Intégration & suite" },
  { id: "daily_draw", label: "Tirage du jour", hint: "Oracle & transits" },
  { id: "referral", label: "Parrainage", hint: "Invitation à partager" },
  { id: "announcement", label: "Annonce", hint: "Date & places" },
];
