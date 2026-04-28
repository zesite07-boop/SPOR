# Serey Padma · Oasis Oracle Reiki

Application Next.js 15 (App Router) pour Serey Padma : retraites Reiki, oracle quotidien, modules métiers, mode offline PWA (Dexie), et intégration optionnelle Supabase/Stripe.

## Prérequis

- Node.js 20+
- npm 10+

## Installation locale

1. Installer les dépendances :
   - `npm install`
2. Copier les variables d’environnement :
   - `cp .env.example .env.local`
3. Lancer en développement :
   - `npm run dev`

## Variables d’environnement (Vercel)

Configurer ces variables dans Vercel (Project Settings > Environment Variables) :

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL` (optionnel)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optionnel)
- `STRIPE_SECRET_KEY` (optionnel, requis pour checkout Stripe)
- `NEXT_PUBLIC_SHOW_DEMO_BADGE` (`true` ou `false`)

Si Supabase n’est pas configuré, l’application fonctionne en mode local/offline (Dexie + PWA).

## Vérifications avant déploiement

- Lint :
  - `npm run lint`
- Build de production :
  - `npm run build`
- Lancer le build localement :
  - `npm run start`

## Déploiement Vercel

### Option A — Via interface Vercel

1. Importer le repository dans Vercel.
2. Définir les variables d’environnement listées plus haut.
3. Build command : `npm run build`
4. Install command : `npm install`
5. Output : `.next` (détection automatique Next.js)
6. Déployer.

### Option B — Via CLI Vercel

1. Installer la CLI :
   - `npm i -g vercel`
2. Connecter le projet :
   - `vercel`
3. Déployer en production :
   - `vercel --prod`

## Checklist mobile / PWA

- Manifest valide (`public/manifest.json`)
- Icônes PWA (`public/icon-192.svg`, `public/icon-512.svg`)
- Splash iOS (`public/apple-splash.svg`)
- Test installation écran d’accueil sur iOS/Android
- Vérifier navigation tactile (44px minimum) et transitions onglets

## Scripts disponibles

- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run start`
