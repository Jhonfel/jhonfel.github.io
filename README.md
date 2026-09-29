# jhonfel.github.io

My personal site: an interactive mechatronics workbench rendered with **WebGPU** (Three.js `WebGPURenderer`, automatic WebGL 2 fallback).
Every object on the bench is a section: hover it and the robot arm points at it, click it and the camera flies in.
The look is borrowed from the STEINS;GATE RE:BOOT opening: white clay, deep teal, peach pixels.

- Content (English / Spanish) lives in `src/content.js`; the HTML menu and panels are built from it, so the site still works without 3D.
- Everything in the scene is modelled in code (`src/scene/`), no external models.
- `?lang=es|en` forces a language, `?webgl` forces the WebGL 2 backend, `#projects` (etc.) opens a section.

```bash
npm install
npm run dev      # local server
npm run build    # static build in dist/
```

Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.
