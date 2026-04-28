/** Signe solaire tropical (frontières calendaires moyennes, sans heure d’ingress). */

export function getSunSign(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const md = m * 100 + d;

  if (md >= 321 && md <= 419) return "Bélier";
  if (md >= 420 && md <= 520) return "Taureau";
  if (md >= 521 && md <= 620) return "Gémeaux";
  if (md >= 621 && md <= 722) return "Cancer";
  if (md >= 723 && md <= 822) return "Lion";
  if (md >= 823 && md <= 922) return "Vierge";
  if (md >= 923 && md <= 1022) return "Balance";
  if (md >= 1023 && md <= 1121) return "Scorpion";
  if (md >= 1122 && md <= 1221) return "Sagittaire";
  if (md >= 1222 || md <= 119) return "Capricorne";
  if (md >= 120 && md <= 218) return "Verseau";
  return "Poissons";
}
