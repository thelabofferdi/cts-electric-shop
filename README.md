# CTS Electric Shop

Boutique motos électriques China Trade Services — frontend Vite/React autonome pour **shop.chinatradeservice.site**.

## Stack

- **Frontend** : Vite + React + Tailwind (ce dépôt)
- **Backend** : API FastAPI partagée ([china-trade-services](https://github.com/thelabofferdi/china-trade-services)) — routes `/api/v1/public/shop` et `/api/v1/admin/shop/*`

## Développement local

```bash
cp .env.example .env
npm install
npm run dev
```

Ouvrir http://localhost:8082 — l'API doit tourner sur `VITE_API_URL` (défaut `http://localhost:8000`).

## Build production

```bash
npm run build
npm run preview
```

Déployer le dossier `dist/` sur Coolify/Vercel avec le domaine `shop.chinatradeservice.site`.

## Routes

| URL | Page |
|---|---|
| `/` | Vitrine |
| `/moto/:slug` | Fiche produit |
| `/mastering` | Admin boutique (auth admin CTS) |

## Variables d'environnement

| Variable | Description |
|---|---|
| `VITE_API_URL` | URL de l'API FastAPI (obligatoire en prod) |
| `VITE_SHOP_DEMO` | `true` pour le mode démo sans backend |
