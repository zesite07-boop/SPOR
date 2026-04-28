import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Flower2, Heart, MoonStar, Sparkles, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Landing — Retraites Reiki et Oracle",
  description:
    "Landing publique Serey Padma : retraites Reiki premium, oracle quotidien, témoignages et expérience élégante pensée mobile.",
  openGraph: {
    title: "Serey Padma — Retraites Reiki et Oracle",
    description:
      "Découvre un sanctuaire premium : retraites Reiki, guidance poétique, oracle quotidien et expérience fluide sur mobile.",
    url: "/landing",
    images: [{ url: "/icon-512.svg", width: 512, height: 512, alt: "Serey Padma - landing premium" }],
  },
};

export default function LandingPage() {
  return (
    <main className="padma-aura-bg min-h-dvh px-4 py-12 md:py-16">
      <div className="mx-auto max-w-5xl space-y-16">
        <section className="relative overflow-hidden rounded-[2rem] border border-padma-champagne/28 bg-white/70 p-7 shadow-soft backdrop-blur-md dark:border-padma-lavender/20 dark:bg-padma-night/50 md:p-10">
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-padma-champagne/16 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 h-64 w-64 rounded-full bg-padma-lavender/18 blur-2xl" />
          <p className="relative z-10 font-cinzel text-[0.72rem] uppercase tracking-[0.35em] text-padma-pearl dark:text-padma-lavender/85">
            Serey Padma
          </p>
          <h1 className="relative z-10 mt-4 max-w-3xl font-cinzel text-4xl leading-tight text-padma-night dark:text-padma-cream md:text-6xl">
            Un lotus digital pour rayonner, accueillir et guider avec une elegance sereine.
          </h1>
          <p className="relative z-10 mt-5 max-w-2xl text-lg leading-relaxed text-padma-night/78 dark:text-padma-cream/82">
            Serey Padma unit elegance, organisation et spiritualite concrete : tu accueilles, tu guides, tu rayonnes, avec fluidite.
          </p>
          <div className="relative z-10 mt-8 flex flex-wrap gap-3">
            <Link
              href="/reservation"
              className="touch-min inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-oasis-champagne to-oasis-lavender px-6 py-3 font-cinzel text-sm text-padma-night shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow"
            >
              Découvrir les retraites
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/oracle"
              className="touch-min inline-flex items-center gap-2 rounded-full border border-padma-champagne/45 bg-white/75 px-6 py-3 text-sm text-padma-night transition-all duration-300 hover:-translate-y-0.5 dark:border-padma-lavender/35 dark:bg-padma-night/55 dark:text-padma-cream"
            >
              Explorer l&apos;Oracle
            </Link>
            <Link
              href="/connexion?next=/"
              className="touch-min inline-flex items-center gap-2 rounded-full border border-oasis-reiki/35 bg-oasis-reiki/10 px-6 py-3 text-sm font-medium text-oasis-reiki transition-all duration-300 hover:-translate-y-0.5 dark:border-oasis-champagne/35 dark:bg-oasis-champagne/12 dark:text-oasis-champagne"
            >
              Commencer une demo
            </Link>
          </div>
          <p className="relative z-10 mt-4 text-sm text-padma-night/70 dark:text-padma-cream/75">
            En 2 minutes : ouvre la demo, teste l&apos;oracle et reserve un sejour test depuis ton mobile.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="padma-card p-5">
            <MoonStar className="h-5 w-5 text-padma-champagne" aria-hidden />
            <h2 className="mt-3 font-cinzel text-lg text-padma-night dark:text-padma-cream">Rythme lunaire</h2>
            <p className="mt-2 text-sm text-padma-night/75 dark:text-padma-cream/78">Calendrier cosmique lisible, respiration et clarté.</p>
          </article>
          <article className="padma-card p-5">
            <Heart className="h-5 w-5 text-padma-lavender" aria-hidden />
            <h2 className="mt-3 font-cinzel text-lg text-padma-night dark:text-padma-cream">Accompagnement sensible</h2>
            <p className="mt-2 text-sm text-padma-night/75 dark:text-padma-cream/78">Textes bienveillants, flow TDAH-friendly, ancrage doux.</p>
          </article>
          <article className="padma-card p-5">
            <Sparkles className="h-5 w-5 text-oasis-reiki" aria-hidden />
            <h2 className="mt-3 font-cinzel text-lg text-padma-night dark:text-padma-cream">Mode local sécurisant</h2>
            <p className="mt-2 text-sm text-padma-night/75 dark:text-padma-cream/78">Dexie + PWA : ton espace reste vivant, même hors réseau.</p>
          </article>
        </section>

        <section className="rounded-[1.75rem] border border-padma-champagne/24 bg-white/65 p-7 shadow-soft dark:border-padma-lavender/20 dark:bg-padma-night/45 md:p-9">
          <div className="flex items-center gap-2">
            <Flower2 className="h-5 w-5 text-padma-champagne" aria-hidden />
            <h2 className="font-cinzel text-2xl text-padma-night dark:text-padma-cream">Section Oracle</h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-padma-night/78 dark:text-padma-cream/82">
            Tirage du jour, interpretations poetiques et guidance operationnelle : chaque message relie intuition, decision et action.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/oracle"
              className="touch-min inline-flex items-center gap-2 rounded-full border border-padma-lavender/35 bg-padma-lavender/12 px-5 py-2.5 text-sm text-padma-night transition-all hover:-translate-y-0.5 dark:text-padma-cream"
            >
              Tirer l&apos;Oracle du jour
            </Link>
            <Link
              href="/bien-etre"
              className="touch-min inline-flex items-center gap-2 rounded-full border border-padma-champagne/35 bg-white/75 px-5 py-2.5 text-sm text-padma-night transition-all hover:-translate-y-0.5 dark:bg-padma-night/55 dark:text-padma-cream"
            >
              Voir le bien-etre quotidien
            </Link>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 text-padma-champagne" aria-hidden />
            <h2 className="font-cinzel text-2xl text-padma-night dark:text-padma-cream">Elles en parlent</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="padma-card-quiet p-5">
              <p className="text-sm italic leading-relaxed text-padma-night/78 dark:text-padma-cream/82">
                “Je me sens tenue et libre à la fois. Tout est fluide, même sur mobile, même sans connexion.”
              </p>
              <p className="mt-3 font-cinzel text-sm text-padma-night dark:text-padma-cream">Lina, thérapeute intuitive</p>
            </article>
            <article className="padma-card-quiet p-5">
              <p className="text-sm italic leading-relaxed text-padma-night/78 dark:text-padma-cream/82">
                “Le mélange de structure et de poésie est rare. Je gagne du temps sans perdre mon âme de marque.”
              </p>
              <p className="mt-3 font-cinzel text-sm text-padma-night dark:text-padma-cream">Camille, créatrice de retraites</p>
            </article>
            <article className="padma-card-quiet p-5">
              <p className="text-sm italic leading-relaxed text-padma-night/78 dark:text-padma-cream/82">
                “Le Mode Hyperfocus est précieux pour mon TDAH : moins de bruit, plus d&apos;élan.”
              </p>
              <p className="mt-3 font-cinzel text-sm text-padma-night dark:text-padma-cream">Nora, praticienne Reiki</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
