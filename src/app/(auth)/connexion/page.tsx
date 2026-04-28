import Link from "next/link";
import { Suspense } from "react";
import { MagicLinkForm } from "@/components/auth/magic-link-form";

/**
 * Page de connexion **Serey Padma** — magic link uniquement.
 * Design : or rose champagne, lavande, bleu nacré, crème ; titres Cinzel / corps Playfair via `font-display`.
 */
export default function ConnexionPage() {
  return (
    <div className="padma-aura-bg flex min-h-dvh flex-col items-center justify-center px-4 py-14">
      <div className="w-full max-w-md">
        {/* Halo décoratif doux */}
        <div className="pointer-events-none mb-10 flex flex-col items-center text-center">
          <p className="font-cinzel text-[0.65rem] uppercase tracking-[0.45em] text-padma-pearl dark:text-padma-lavender/90">
            Serey Padma
          </p>
          <h1 className="mt-3 font-cinzel text-3xl font-normal tracking-[0.08em] text-padma-night dark:text-padma-cream sm:text-[2rem]">
            Entrer dans le sanctuaire
          </h1>
          <p className="mt-4 max-w-sm font-display text-sm italic leading-relaxed text-padma-night/70 dark:text-padma-cream/75">
            Un lien lumineux arrive dans ta boîte mail — aucun mot de passe, juste une invitation à traverser le seuil.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-padma-champagne/40 bg-white/70 p-8 shadow-[0_24px_60px_-24px_rgba(168,180,200,0.45)] backdrop-blur-md dark:border-padma-lavender/25 dark:bg-padma-night/55">
          <Suspense
            fallback={
              <p className="text-center text-sm text-padma-night/60 dark:text-padma-cream/60">Préparation du formulaire…</p>
            }
          >
            <MagicLinkForm />
          </Suspense>
        </div>

        <p className="mt-10 text-center font-display text-xs text-padma-night/50 dark:text-padma-cream/50">
          <Link
            href="/"
            className="underline decoration-padma-champagne/50 underline-offset-4 transition-colors hover:text-padma-lavender dark:hover:text-padma-champagne"
          >
            Retour à l’accueil
          </Link>
          <span className="mx-2 opacity-40">·</span>
          Mode hors ligne &amp; Dexie restent disponibles sans compte.
        </p>
      </div>
    </div>
  );
}
