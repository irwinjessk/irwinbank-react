# IrwinBank

Interface React du projet IrwinBank.

## Prérequis

- Node.js 22

## Installation

```bash
npm install
cp .env.example .env
npm run dev
```

L'application tourne sur http://localhost:5173. L'écran d'accueil est la connexion (`/connexion`).

`VITE_API_URL` pointe vers l'API Django locale (`http://localhost:8000`).

## Build

```bash
npm run build
```

## Déploiement

`vercel.json` envoie le build Vite vers Vercel et pointe `VITE_API_URL` vers `https://irwinbank-api.onrender.com`. Importer le dépôt `irwinbank-react` dans Vercel, branche `main`.
