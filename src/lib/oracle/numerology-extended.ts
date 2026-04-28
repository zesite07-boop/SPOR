/** Numérologie offline — chemin de vie, nombre d’âme (voyelles), thèmes bienveillants. */

function sumDigits(n: number): number {
  return String(Math.abs(Math.floor(n)))
    .split("")
    .reduce((a, c) => a + Number(c), 0);
}

function reduceNumber(n: number): number {
  let x = n;
  while (x > 9 && x !== 11 && x !== 22 && x !== 33) {
    x = sumDigits(x);
  }
  return x;
}

/** Chemin de vie : somme des chiffres de la date de naissance (JJ MMMM), réduction jusqu’à 1–9 ou maître 11/22/33. */
export function lifePathNumber(date: Date): number {
  const ds = `${date.getDate()}${date.getMonth() + 1}${date.getFullYear()}`;
  let n = ds.split("").reduce((a, c) => a + Number(c), 0);
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = sumDigits(n);
  }
  return n;
}

export const LIFE_PATH_THEMES: Record<number, string> = {
  1: "pionnière, tu ouvres la voie avec une flamme intérieure respectueuse.",
  2: "médiatrice, tu tisses la paix et la douceur dans les duos.",
  3: "créatrice, tu donnes forme à la joie et à la parole juste.",
  4: "bâtisseuse, tu ancrages le sacré dans le quotidien.",
  5: "exploratrice, tu honores le mouvement et les vérités changeantes.",
  6: "gardienne du cœur, tu embellis le foyer et les liens.",
  7: "mystique patiente, tu cherches la lampe au fond du silence.",
  8: "alchimiste du monde, tu équilibres pouvoir et service.",
  9: "âme universaliste, tu closes les cycles avec compassion.",
  11: "messagère intuitive, tu portes une lumière fine et inspirante.",
  22: "architecte d’âme, tu rêves des structures qui élèvent le collectif.",
  33: "âme maîtresse-compassion, tu guéris par la présence et l’enseignement doux.",
};

/** Voyelles — somme pythagoricienne classique (A=1 … I=9), réduite. */
const VOWEL_VALUE: Record<string, number> = {
  a: 1,
  e: 5,
  i: 9,
  o: 6,
  u: 3,
  y: 7,
};

/** Nombre d’âme : voyelles du nom affiché (accents neutralisés). */
export function soulUrgeNumber(fullName: string): number | null {
  const cleaned = fullName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, "");
  if (!cleaned.trim()) return null;
  const vowels = cleaned.replace(/[^aeiouy]/g, "");
  if (!vowels.length) return null;
  let sum = 0;
  for (const ch of vowels) {
    sum += VOWEL_VALUE[ch] ?? 0;
  }
  return reduceNumber(sum);
}

export const SOUL_URGE_THEMES: Record<number, string> = {
  1: "ton désir profond est d’être authentique et lumineuse, sans dominer.",
  2: "ton âme aspire à l’harmonie, au tandem et à la réceptivité.",
  3: "ton cœur veut jouer, inventer et dire la beauté.",
  4: "tu cherches la solidité douce, le rituel et la maison intérieure.",
  5: "tu avides de liberté bien choisie et de vérités vécues.",
  6: "tu vis pour embellir, soigner et rassembler.",
  7: "tu veux comprendre le mystère sans t’y perdre.",
  8: "tu veux incarner une abondance juste et protectrice.",
  9: "tu veux offrir amour et compassion sans te dissoudre.",
};
