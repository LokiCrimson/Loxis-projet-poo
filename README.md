<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/94a0c54c-2464-49e2-809e-0a7562ae28d1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Nouveautés (Front-end)

La partie frontend a été enrichie récemment avec une refonte de la page d'accueil et plusieurs sections marketing et fonctionnelles :

- Nouvelle page d'accueil en mode sombre avec design "Aurora" (glassmorphism + gradients animés).
- Barre de navigation complète : `Fonctionnalités`, `Chiffres`, `Tarifs`, `FAQ`.
- Sections ajoutées : Statistiques, Grille de fonctionnalités (Bento), Témoignages, Tarification, FAQ et CTA.
- Intégration d'animations avec Framer Motion et d'icônes via `lucide-react`.
- Composants visuels de démonstration affichant des exemples de biens et revenus.

Voir le README dédié au frontend pour l'architecture, la structure des fichiers et la liste détaillée des fonctionnalités : [README frontend](README-frontend.md)
