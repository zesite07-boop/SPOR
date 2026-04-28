/** Réduction numérologique 1–9 (jour personnel approximatif : jour + mois + année). */

function reduceToDigit(n: number): number {
  let x = Math.abs(Math.floor(n));
  while (x > 9) {
    x = String(x)
      .split("")
      .reduce((a, c) => a + Number(c), 0);
  }
  if (x === 0) return 9;
  return x;
}

export function personalDayNumber(date: Date): number {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return reduceToDigit(day + month + reduceToDigit(year));
}

export const DAY_NUMBER_THEMES: Record<number, string> = {
  1: "nouveau départ et courage doux",
  2: "écoute, duo et réceptivité",
  3: "expression, joie créative et partage",
  4: "ancrage, structure bienveillante et soin du temple",
  5: "mouvement, souplesse et exploration sensorielle",
  6: "harmonie du foyer, beauté et tendresse",
  7: "introspection, silence fertile et intuition",
  8: "abondance équilibrée et responsabilité lumineuse",
  9: "clôture douce, compassion et transmission",
};
