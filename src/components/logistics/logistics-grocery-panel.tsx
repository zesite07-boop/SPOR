"use client";

import type { RetreatDefinition } from "@/lib/reservation/catalog";
import type { LogisticsParticipant } from "@/lib/db/schema";
import { buildGroceryList } from "@/lib/logistics/grocery-engine";
import { totalPersonDays } from "@/lib/logistics/seed-logistics";

export function LogisticsGroceryPanel({
  retreat,
  participants,
}: {
  retreat: RetreatDefinition;
  participants: LogisticsParticipant[];
}) {
  const heads = participants.reduce((a, p) => a + Math.max(1, p.partySize), 0);
  const pd = totalPersonDays(participants, retreat);
  const allergiesPool = participants.map((p) => p.allergies ?? "").filter(Boolean);
  const lines = buildGroceryList(pd, allergiesPool);
  const retreatSuggestions = retreat.includedEverywhere.slice(0, 4);

  return (
    <section className="rounded-2xl border border-padma-champagne/30 bg-white/80 p-5">
      <h3 className="font-cinzel text-lg text-padma-night">Liste courses indicative</h3>
      <p className="mt-2 text-xs text-padma-night/65">
        Base : <strong>{heads}</strong> personne(s) × durée du séjour — ajuste selon producteur·rice &amp; saison.
      </p>
      <ul className="mt-4 space-y-2">
        {lines.map((line, i) => (
          <li
            key={`${line.item}-${i}`}
            className="flex flex-wrap justify-between gap-2 rounded-lg border border-padma-pearl/25 bg-padma-cream/40 px-3 py-2 text-sm"
          >
            <span className="text-padma-night">{line.item}</span>
            <span className="font-medium text-padma-night/80">{line.qty}</span>
            {line.note && <p className="w-full text-xs text-padma-night/60">{line.note}</p>}
          </li>
        ))}
        {retreatSuggestions.map((s) => (
          <li
            key={`retreat-${s}`}
            className="rounded-lg border border-padma-lavender/25 bg-padma-lavender/8 px-3 py-2 text-sm text-padma-night/85"
          >
            Suggestion retreat : {s}
          </li>
        ))}
      </ul>
    </section>
  );
}
