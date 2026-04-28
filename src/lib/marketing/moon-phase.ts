/** Phase lunaire courte pour copy marketing (approximation cyclique ~29,5 j). */
export function moonPhaseLabelFr(date: Date): string {
  const synodic = 29.53058770576;
  const knownNew = Date.UTC(2000, 0, 6, 18, 14, 0);
  const phase =
    ((((date.getTime() - knownNew) / 86400000) % synodic) + synodic) % synodic;
  const d = synodic / 8;
  if (phase < d) return "nouvelle lune naissante";
  if (phase < 2 * d) return "premier croissant";
  if (phase < 3 * d) return "premier quartier";
  if (phase < 4 * d) return "lune gibbeuse ascendante";
  if (phase < 5 * d) return "pleine lune";
  if (phase < 6 * d) return "lune gibbeuse descendante";
  if (phase < 7 * d) return "dernier quartier";
  return "croissant descendant";
}
