# README DEPLOIEMENT - Serey Padma

Ce document couvre le déploiement production sur Vercel, les variables d'environnement, les commandes utiles, et la checklist post-déploiement.

## 1) Déploiement Vercel (GitHub)

1. Pousser la branche sur GitHub.
2. Ouvrir [Vercel](https://vercel.com/) et cliquer `Add New Project`.
3. Importer le repository `oasis-oracle-reiki`.
4. Vérifier les settings build :
   - Framework Preset : `Next.js`
   - Install Command : `npm install`
   - Build Command : `npm run build`
   - Output Directory : `.next` (auto)
5. Ajouter les variables d'environnement (section 3).
6. Déployer.
7. Une fois en ligne, renseigner l'URL prod dans `NEXT_PUBLIC_APP_URL` et `NEXT_PUBLIC_SITE_URL`.

## 2) Déploiement Vercel (CLI)

### Prérequis

- Avoir un compte Vercel connecté.
- Installer la CLI :
  - `npm i -g vercel`

### Commandes

- Login :
  - `vercel login`
- Lier le projet :
  - `vercel`
- Déployer preview :
  - `npm run preview`
  - (équivaut à `npx vercel`)
- Déployer production :
  - `npm run deploy`
  - (équivaut à `npx vercel --prod`)

## 3) Variables d'environnement requises

Copier `.env.example` en `.env.local` pour local, puis reproduire les mêmes variables dans Vercel.

### Variables principales

- `NEXT_PUBLIC_APP_URL`
  - Exemple local : `http://localhost:3000`
  - Exemple prod : `https://serey-padma.vercel.app`
- `NEXT_PUBLIC_SITE_URL`
  - Exemple local : `http://localhost:3000`
  - Exemple prod : `https://serey-padma.vercel.app`
- `NEXT_PUBLIC_SHOW_DEMO_BADGE`
  - `true` (visible) / `false` (masqué)

### Supabase (optionnel)

- `NEXT_PUBLIC_SUPABASE_URL`
  - Exemple : `https://xxxx.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Exemple : `eyJhbGciOi...`

Sans ces deux variables, l'app fonctionne en mode local Dexie/PWA.

### Stripe (optionnel)

- `STRIPE_SECRET_KEY`
  - Exemple : `sk_test_...` ou `sk_live_...` en production

Si absente, checkout en ligne désactivé, fallback local conservé.

### Optionnel futur

- `STRIPE_WEBHOOK_SECRET`
  - Exemple : `whsec_...`

## 4) Commandes utiles (avant déploiement)

- Installer :
  - `npm install`
- Lint :
  - `npm run lint`
- Build production :
  - `npm run build`
- Vérifier localement le build :
  - `npm run start`
- Déploiement preview :
  - `npm run preview`
- Déploiement production :
  - `npm run deploy`

## 5) Checklist post-déploiement

### Technique

- [ ] Le build Vercel est vert.
- [ ] `robots.txt` répond correctement.
- [ ] `sitemap.xml` répond correctement.
- [ ] `/landing` est accessible sans session.
- [ ] PWA : `manifest.json`, `sw.js`, icônes et splash chargent correctement.

### Fonctionnelle

- [ ] Navigation 6 onglets OK sur mobile.
- [ ] Mode Hyperfocus fonctionne sur modules principaux.
- [ ] Mode Démo/local géré comme attendu (`NEXT_PUBLIC_SHOW_DEMO_BADGE`).
- [ ] Oracle et marketing local fonctionnent hors ligne.
- [ ] Réservation :
  - [ ] fallback local OK sans Stripe
  - [ ] checkout Stripe OK avec clé active

### Sécurité/configuration

- [ ] Aucune clé secrète exposée dans le client.
- [ ] Aucune clé sensible commitée dans le repo.
- [ ] Variables Vercel configurées par environnement (`Preview` / `Production`).

## 6) Notes production

- Si vous activez Supabase :
  - vérifier `Site URL` et `Redirect URLs` sur `/auth/callback`.
- Si vous activez Stripe :
  - utiliser `sk_live_...` uniquement en environnement production.
- Toujours redéployer après changement de variables d'environnement.
