/**
 * Liste courses indicative — portions par personne-jour, ajustements allergies (mots-clés simples).
 */

export type GroceryLine = {
  item: string;
  qty: string;
  note?: string;
};

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Agrège les mentions d’allergies des participantes. */
export function allergyHints(allergiesText: string[]): string[] {
  const joined = norm(allergiesText.filter(Boolean).join(" "));
  const hints: string[] = [];
  if (/(gluten|ble)/.test(joined)) hints.push("Sans gluten : privilégier riz complet, quinoa, pain sans gluten.");
  if (/(lactose|lait)/.test(joined)) hints.push("Sans lactose : laits végétaux, yaourt coco.");
  if (/(noix|cacahu|arachide|fruit à coque)/.test(joined)) hints.push("Sans fruits à coque : cuisine dédiée, étiquetage.");
  if (/(soja)/.test(joined)) hints.push("Sans soja : éviter tamari classique / tofu sauf accord.");
  return hints;
}

export function buildGroceryList(totalPersonDays: number, allergiesPool: string[]): GroceryLine[] {
  const base = Math.max(1, totalPersonDays);
  const vegKg = Math.max(2, Math.round(base * 0.35 * 10) / 10);
  const fruitKg = Math.max(1, Math.round(base * 0.2 * 10) / 10);
  const grainKg = Math.max(0.5, Math.round(base * 0.12 * 10) / 10);
  const legumesKg = Math.max(0.5, Math.round(base * 0.15 * 10) / 10);

  const lines: GroceryLine[] = [
    { item: "Légumes de saison (poêlées / soupes)", qty: `~${vegKg} kg` },
    { item: "Fruits & citron", qty: `~${fruitKg} kg` },
    { item: "Céréales / pseudo-céréales", qty: `~${grainKg} kg` },
    { item: "Légumineuses", qty: `~${legumesKg} kg` },
    { item: "Huile olive & ghee / coco", qty: "selon stocks" },
    { item: "Tisanes & épices douces", qty: "paniers herbes + miel local si accord" },
    { item: "Eau filtrée / carafes", qty: `${Math.ceil(base / 3)} L / jour estimatif` },
  ];

  const hints = allergyHints(allergiesPool);
  hints.forEach((h, i) => lines.push({ item: `Attention ${i + 1}`, qty: "", note: h }));

  return lines;
}
