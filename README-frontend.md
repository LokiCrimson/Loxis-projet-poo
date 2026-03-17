# README - Frontend (Loxis)

Ce document présente l'architecture, les fonctionnalités et les récents ajouts apportés à la partie frontend du projet (dossier `src`).

## Aperçu

- Framework : React (Vite)
- Styling : Tailwind CSS
- Animations : Framer Motion (`motion/react`)
- Icônes : lucide-react

## Structure principale

- `src/`
  - `App.jsx` : point d'entrée React
  - `main.tsx` / `index.css` : initialisation et styles globaux
  - `pages/` : pages de l'application
    - `Public/LandingPage.jsx` : page d'accueil publique (refonte)
    - `Auth/` : pages d'authentification (Login/Register)
    - `Core/`, `Finances/`, `Properties/`, `Leases/`, `Tenants/` : pages métiers
  - `components/` : composants réutilisables (Layout, UI, Modal...)
  - `services/api.js` : client API vers le backend

## Comment lancer le frontend

1. Installer les dépendances :

```bash
npm install
```

2. Lancer le serveur de développement :

```bash
npm run dev
```

3. Construire pour la production :

```bash
npm run build
```

## Architecture et décisions techniques

- Vite pour des builds rapides et un hot-reload performant.
- Tailwind CSS pour accélérer le développement UI avec utilitaires et thèmes sombres.
- Framer Motion pour animations et effets parallax (utilisé dans la page d'accueil).
- Composants découplés : la logique métier reste dans `services/` et `pages/`, UI dans `components/`.

## Fonctionnalités principales (front-end)

- Page d'accueil publique réimaginée pour la conversion : hero, démonstration visuelle (cartes de biens), sections produits, témoignages, tarification et FAQ.
- Dashboard preview : carte visuelle montrant revenus et liste de biens (mock data pour présentation).
- Navigation fluide avec ancres (`#features`, `#stats`, `#pricing`, `#faq`).
- CTA visible et formulaires d'inscription/connexion.
- Design responsive et optimisé pour desktop/tablettes.

## Nouveaux ajouts (détail)

- `src/pages/Public/LandingPage.jsx` : refonte complète, sections ajoutées :
  - Hero animé avec CTA
  - Stats (compteurs clés)
  - Bento Features Grid (Tableau de bord, Coffre-fort légal, Paiements automatiques, Espace locataire)
  - Témoignages (cartes)
  - Tarification (plans Découverte & Premium)
  - FAQ et CTA final

- Intégration d'icônes `lucide-react` et d'animations Framer Motion sur les éléments flottants et les entrées de sections.
- Correction de plusieurs erreurs de syntaxe JSX et standardisation des mappings (ex : `items.map(...)`) pour s'assurer de la compatibilité Vite/esbuild.

## Recommandations & prochaines étapes

- Extraire les sections lourdes (Pricing, Testimonials) en composants séparés pour améliorer la lisibilité et le chunking (code-splitting).
- Ajouter des tests visuels (Storybook ou tests d'intégration) pour valider les composants du Landing.
- Remplacer les mocks visibles dans la démo (ex. `items`) par intégration API quand les endpoints backend sont prêts.
- Ajouter un mécanisme d'internationalisation (i18n) si besoin pour le multi-langue.

## Liens utiles

- Code source du frontend : `src/`
- Page d'accueil : `src/pages/Public/LandingPage.jsx`

---

Si tu veux, je peux :
- extraire les sections en composants réutilisables,
- créer des stories Storybook pour les nouvelles UI cards,
- ou traduire tout le contenu en anglais.
