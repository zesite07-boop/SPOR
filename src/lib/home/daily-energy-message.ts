import { getMoonDayInfo } from "@/lib/cosmic/lunar";
import { DAY_NUMBER_THEMES, personalDayNumber } from "@/lib/cosmic/numerology";
import { getSunSign } from "@/lib/cosmic/sun-sign";

const WHISPERS = [
  "Respire une fois de plus : ce souffle est déjà une offrande.",
  "Ce qui est lent peut être saint ; laisse le temps te tenir.",
  "Ton corps sait avant les mots — écoute ses micro-mouvements.",
  "La douceur n’est pas une faiblesse : c’est une orientation.",
  "Rien n’est exigé de toi aujourd’hui sauf d’être honnête avec ton seuil.",
  "Choisis une couleur et porte-la en toi comme une prière silencieuse.",
  "Les autres mondes peuvent attendre : celui-ci te demande présence.",
];

export function getDailyEnergyMessage(date: Date, firstName?: string): string {
  const moon = getMoonDayInfo(date);
  const sun = getSunSign(date);
  const n = personalDayNumber(date);
  const theme = DAY_NUMBER_THEMES[n] ?? "présence au présent";
  const seed = date.getDate() + (date.getMonth() + 1) * 31;
  const whisper = WHISPERS[seed % WHISPERS.length];
  const toYou = firstName ? `, ${firstName}` : "";

  return `La ${moon.labelFr.toLowerCase()} danse avec toi${toYou}, sous le Soleil en ${sun}. Ton jour personnel (${n}) invite ${theme}. ${whisper}`;
}
