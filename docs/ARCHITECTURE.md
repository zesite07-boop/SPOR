# Oasis Oracle Reiki — Architecture technique

Application **Progressive Web App** installable, **mobile-first**, **offline-first**, orientée entrepreneuses neuroatypiques (TDAH).

## Stack

| Couche | Choix |
|--------|--------|
| Framework | **Next.js 15** (App Router) |
| Langage | **TypeScript** |
| Styles | **Tailwind CSS** + tokens CSS (`globals.css`) |
| Composants UI | **Radix primitives** + patterns type shadcn (`src/components/ui`) |
| État global | **Zustand** (UI, hyperfocus, undo léger) |
| Persistance locale | **Dexie.js** (IndexedDB) — données utilisateur hors ligne |
| Backend optionnel | **Supabase** (auth + sync quand ligne disponible) |
| Thème | **next-themes** — mode sombre doux automatique selon système |
| Animations | **Framer Motion** |
| PWA | **@ducanh2912/next-pwa** |

## Principes offline-first

1. Lecture/écriture prioritaire dans **Dexie** (`src/lib/db`).
2. File d’attente de synchronisation (`syncQueue`) pour pousser vers Supabase au retour ligne.
3. Assets critiques en cache via le Service Worker généré par next-pwa.

## Navigation — 6 onglets fixes (bottom bar)

| # | Route | Module métier |
|---|--------|----------------|
| 1 | `/` | **Accueil & Réservation** — calendrier cosmique, lunes, transits (placeholders étendus progressivement) |
| 2 | `/logistique` | **Logistique & Opérations** — agendas drag & drop, check-lists, courses |
| 3 | `/bien-etre` | **Profil & Outils Bien-Être** — oracle (astro / numéro / tarot), journal, bibliothèque |
| 4 | `/communaute` | **Communauté & Marketing** — générateur IA contenus, veille gamifiée |
| 5 | `/oracle-ludique` | **Espace Contrôle Ludique** — mandala dashboard, simulateurs freelance |
| 6 | `/tresor` | **Tableau de Bord Business** — « Carte du Trésor Cosmique » |

Le layout `(main)` enveloppe ces routes et rend `BottomNav`.

## Authentification

- Page **`/connexion`** : email + magic link Supabase (structure prête ; clés `.env`).
- Middleware **`src/middleware.ts`** : pour l’instant laisse passer tout en dev ; à durcir avec session Supabase.

## Modules oracle (évolution)

- **Astrologie / Numérologie** : calculs côté client dans `src/lib/oracle/` (à enrichir).
- **Tarot** : jeu 78 cartes + spreads dans `src/lib/tarot/`.
- **IA** : appels API (Grok / Gemini / Claude) via route handlers `src/app/api/ai/*` avec consentement RGPD.

## Conformité

- **RGPD** : bannière consentement + politique (pages légales à brancher).
- **Stripe** : checkout via route API + webhooks (placeholder).

## Structure des dossiers

```
src/
  app/
    (auth)/connexion/
    (main)/           # shell + bottom nav
    api/
    layout.tsx
    globals.css
  components/
    layout/           # BottomNav, ShellHeader
    home/             # widgets accueil
    ui/               # Button, Card, etc.
  lib/
    db/               # Dexie schema
    stores/           # Zustand
    supabase/         # client browser + server
```

## Phases de livraison

1. **Terminé** : architecture, design system, PWA, Dexie, navigation 6 onglets, accueil + connexion squelette.
2. **Suivant** : auth Supabase réelle, module Accueil (calendrier cosmique), puis Logistique, etc.
