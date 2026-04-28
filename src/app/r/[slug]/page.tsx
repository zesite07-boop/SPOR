import { notFound } from "next/navigation";
import Link from "next/link";
import { getRetreatByPublicSlug } from "@/lib/reservation/catalog";

function fmtRange(start: string, end: string) {
  const a = new Date(start + "T12:00:00");
  const b = new Date(end + "T12:00:00");
  return `${a.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} — ${b.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}

export default async function PublicRetreatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const retreat = getRetreatByPublicSlug(slug);
  if (!retreat) notFound();

  const minPrice = Math.min(...retreat.packages.map((p) => p.priceEuro));

  return (
    <main className="padma-aura-bg min-h-dvh px-4 py-10">
      <article className="mx-auto max-w-3xl rounded-[1.8rem] border border-padma-champagne/30 bg-white/80 p-6 shadow-soft backdrop-blur-md dark:border-padma-lavender/25 dark:bg-padma-night/55">
        <p className="font-display text-xs uppercase tracking-[0.22em] text-padma-pearl dark:text-padma-lavender/85">Retraite partageable</p>
        <h1 className="mt-2 font-cinzel text-3xl text-padma-night dark:text-padma-cream">{retreat.title}</h1>
        <p className="mt-1 text-sm text-padma-night/75 dark:text-padma-cream/80">{retreat.subtitle}</p>
        <p className="mt-3 text-sm text-padma-night/75 dark:text-padma-cream/82">{retreat.destinationLabel}</p>
        <p className="text-sm text-padma-night/75 dark:text-padma-cream/82">{fmtRange(retreat.startDate, retreat.endDate)}</p>
        <p className="mt-4 text-sm leading-relaxed text-padma-night/82 dark:text-padma-cream/86">{retreat.astroTheme}</p>

        <section className="mt-5">
          <p className="font-cinzel text-lg text-padma-night dark:text-padma-cream">Ce qui est inclus</p>
          <ul className="mt-2 space-y-1 text-sm text-padma-night/80 dark:text-padma-cream/84">
            {retreat.includedEverywhere.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </section>

        <div className="mt-5 rounded-xl border border-padma-champagne/25 bg-padma-cream/40 px-4 py-3 text-sm dark:border-padma-lavender/20 dark:bg-padma-night/45">
          <p>Prix a partir de {minPrice} €</p>
          <p>Places restantes : {retreat.spotsLeft}</p>
        </div>

        <Link
          href={`/reservation/${retreat.id}`}
          className="mt-6 inline-flex touch-min items-center justify-center rounded-full bg-gradient-to-r from-oasis-champagne to-oasis-lavender px-6 py-3 font-cinzel text-sm text-padma-night shadow-soft"
        >
          Je reserve ma place
        </Link>
      </article>
    </main>
  );
}
