/** Veille locale : thèmes tournants (bien-être / astro / numéro) — pas d’API. */
export function getVeilleBullets(date = new Date()): { tag: string; text: string }[] {
  const week = weekNumber(date);
  const wellbeing = [
    {
      tag: "Bien-être",
      text: "Les routines « douces » (marche lente, eau tiède, journal 3 lignes) performent mieux que les défis extrêmes.",
    },
    {
      tag: "Bien-être",
      text: "Sommeil & digestion : les créateurs santé poussent le lien système nerveux / assiette — angle Reiki aligné.",
    },
    {
      tag: "Bien-être",
      text: "Burn-out féminin : contenus courts « permission de ralentir » gardent un fort taux de sauvegarde.",
    },
    {
      tag: "Bien-être",
      text: "La cohérence cardiaque revient dans les reels « 1 minute » — bon alignement avec ton souffle padma.",
    },
  ];
  const astro = [
    {
      tag: "Astrologie",
      text: "Mercure / communications : stories « une phrase honnête » fonctionnent mieux que les longs états.",
    },
    {
      tag: "Astrologie",
      text: "Cycles lunaires : poster 48h avant la nouvelle lune pour intention ; pleine lune pour lâcher-prise.",
    },
    {
      tag: "Astrologie",
      text: "Saison mutante : les transitions de signe favorisent les carrousels « avant / pendant / après ».",
    },
    {
      tag: "Astrologie",
      text: "Astrologie populaire : focus ascendant + lune pour rendre ton contenu tangible sans jargon.",
    },
  ];
  const numero = [
    {
      tag: "Numérologie",
      text: "Les posts « nombre du jour » en 5 lignes cartonnent — tu as déjà le jour personnel dans le studio.",
    },
    {
      tag: "Numérologie",
      text: "Comparer chemin de vie et besoin du moment : bon hook pour email ou slide 2 carrousel.",
    },
    {
      tag: "Numérologie",
      text: "Éviter les prédictions fermes ; privilégier « invitation » et « résonance » — conformité & douceur.",
    },
    {
      tag: "Numérologie",
      text: "Mini-formules 3+3+3 (mot · sensation · action) lisibles sur mobile.",
    },
  ];

  const pick = <T,>(arr: T[], i: number) => arr[i % arr.length]!;
  return [
    pick(wellbeing, week),
    pick(astro, week + 1),
    pick(numero, week + 2),
  ];
}

function weekNumber(d: Date): number {
  const start = new Date(Date.UTC(d.getFullYear(), 0, 1));
  const diff = d.getTime() - start.getTime();
  const week = Math.floor(diff / (7 * 86400000));
  return Math.max(0, week);
}
