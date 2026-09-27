# Nitish — personal portfolio

React + Vite + JavaScript, Tailwind CSS, GSAP / ScrollTrigger, and Lucide React.

## Run locally

```sh
npm install
npm run dev
```

## Check and build

```sh
npm run lint
npm run build
npm run preview
```

## Personalize

- Put your actual photo at `public/images/profile.jpg`, then restart Vite (or rebuild for production). The hero uses it as a full-background image with muted color, overlays, and parallax. A CSS atmosphere is used until your photo is available.
- Edit project names, descriptions, technologies, images, and URLs in `src/data/projects.js`. The three existing projects are explicitly illustrative concepts, not claimed completed work. Until a live URL is supplied, View Project opens a keyboard-accessible preview dialog.
- Replace the education placeholders in `src/components/Education.jsx` with your real details.
- Edit the introduction in `src/components/About.jsx`.
- Colors, spacing, typography, and responsive layouts are in `src/index.css`.

Each main section has its own component. `Section.jsx` supplies shared headings and scoped scroll animations; the hero and navigation manage their own animations. GSAP animations clean up on unmount and honor reduced-motion preferences. No external image or font service is required.
