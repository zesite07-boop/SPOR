/** Arcanes majeurs — noms usuels FR + mots-clés bienveillants pour tirages offline. */

export type MajorArcana = {
  id: number;
  name: string;
  keyword: string;
  gentle: string;
};

export const MAJOR_ARCANA: MajorArcana[] = [
  { id: 0, name: "Le Mat", keyword: "pureté du commencement", gentle: "tu réinitialises avec innocence et confiance." },
  { id: 1, name: "Le Magicien", keyword: "alignement & ressources", gentle: "tu canalises déjà ce qu’il te faut." },
  { id: 2, name: "La Papesse", keyword: "intuition profonde", gentle: "ta sagesse intérieure parle bas — écoute." },
  { id: 3, name: "L’Impératrice", keyword: "fécondité & beauté", gentle: "la vie te nourrit par les sens et le soin." },
  { id: 4, name: "L’Empereur", keyword: "structure bienveillante", gentle: "tu poses des limites qui protègent ton cœur." },
  { id: 5, name: "Le Pape", keyword: "transmission sacrée", gentle: "un mentor ou un rituel te guide avec douceur." },
  { id: 6, name: "Les Amoureux", keyword: "choix du cœur", gentle: "l’alignement prime sur la précipitation." },
  { id: 7, name: "Le Chariot", keyword: "direction intérieure", gentle: "tu avances quand ton âme dit oui." },
  { id: 8, name: "La Justice", keyword: "clarté équilibrée", gentle: "la vérité se pose sans sévérité inutile." },
  { id: 9, name: "L’Hermite", keyword: "lanterne intérieure", gentle: "le silence est une réponse lumineuse." },
  { id: 10, name: "La Roue de Fortune", keyword: "cycles acceptés", gentle: "le mouvement te révèle une nouvelle porte." },
  { id: 11, name: "La Force", keyword: "douce courageuse", gentle: "ta douceur est une force tranquille." },
  { id: 12, name: "Le Pendu", keyword: "suspension féconde", gentle: "lâcher la lutte ouvre une vision neuve." },
  { id: 13, name: "L’Arcane sans nom", keyword: "renaissance", gentle: "ce qui se dépose nourrit ce qui renaît." },
  { id: 14, name: "Tempérance", keyword: "alchimie douce", gentle: "tu mélanges les mondes avec grâce." },
  { id: 15, name: "Le Diable", keyword: "libération des chaînes", gentle: "tu vois où tu t’attachais — et tu choisis autrement." },
  { id: 16, name: "La Maison Dieu", keyword: "vérité libératrice", gentle: "ce qui tombe faisait de la place pour l’essentiel." },
  { id: 17, name: "L’Étoile", keyword: "espérance tendre", gentle: "la confiance revient comme une eau claire." },
  { id: 18, name: "La Lune", keyword: "rêves & mystère", gentle: "tes émotions sont messagères, pas ennemies." },
  { id: 19, name: "Le Soleil", keyword: "joie naturelle", gentle: "ta lumière simple réchauffe ton chemin." },
  { id: 20, name: "Le Jugement", keyword: "appel de l’âme", gentle: "tu réponds à ce qui veut guérir en toi." },
  { id: 21, name: "Le Monde", keyword: "accomplissement circulaire", gentle: "un cycle se referme dans la reconnaissance." },
];

export function getMajorById(id: number): MajorArcana {
  return MAJOR_ARCANA[id] ?? MAJOR_ARCANA[0];
}
