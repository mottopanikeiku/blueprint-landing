# Blueprint landing

A scroll-driven React landing-page concept that draws an architectural sheet in SVG and pulls back to an illustrated dashboard.

**Question:** can one continuous blueprint explain a proposed sketch/PDF-to-CAD workflow without switching between unrelated screenshots?

[Plan definitions](src/blueprint/plans.ts) supply the house, repeated apartment units, ductwork and parking geometry. [Geometry helpers](src/blueprint/geometry.ts) split walls around openings and transform those plans into sheet coordinates. [Scroll choreography](src/stage/choreography.ts) moves the camera and reveals the drawings before showing the dashboard concept.

**Result:** an implemented frontend, not a CAD-conversion system. The sketch, PDF-style underlay and clean drawing share authored geometry; none is inferred from an uploaded file. The dashboard cursor, review items and download notification are scripted illustrations, not completed processing or exports. There is no measured accuracy or time-saving result in this repository.

[Live page](https://mottopanikeiku.github.io/blueprint-landing/).

## Run locally

Use Node.js 22 and npm, matching the [Pages workflow](.github/workflows/pages.yml). A CPU laptop and a browser are enough; no GPU, model, paid API or paid compute is needed.

```sh
npm ci
npm run build
npm run preview
```

Open the local URL printed by Vite. `npm run dev` is the alternative for editing with hot reload. The build runs TypeScript checking and writes the static site to `dist/`.

## Editing and deployment

- [Section copy](src/content.tsx) also defines the camera stations in sheet coordinates. [Camera math](src/stage/camera.ts) fits them into the viewport; [styles](src/styles.css) hold the black and blue themes.
- The brand remains `[Product]`, an intentional placeholder. Fonts are bundled locally through Fontsource.
- The optional [contact form](src/components/AccessForm.tsx) posts name, email, firm, role and drawing interests to `VITE_EARLY_ACCESS_ENDPOINT`. Without an endpoint the form renders disabled with a notice; the live page currently has none. `.env.example` documents the variable; local environment files are ignored. Any configured endpoint is public in the browser bundle, so never put credentials there. No submitted contact data is stored in this repository.
- The workflow builds pull requests and deploys pushes to `main` to [GitHub Pages](https://mottopanikeiku.github.io/blueprint-landing/). Relative asset paths support the repository subpath.

## Limitations

- No sketch/PDF ingestion, AI inference, DXF writer or spreadsheet export.
- Plan geometry, equipment specifications and review exceptions are synthetic examples, not client-project evidence.
- The illustrated dashboard is not interactive product functionality.
- The form needs an external endpoint before it can send requests.
- There is no automated browser test suite or usability study; the build checks types, not visual quality.

## Prior work and dependencies

This frontend uses [React](https://react.dev/), [Vite](https://vite.dev/), [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [Lenis](https://github.com/darkroomengineering/lenis) and [Fontsource](https://fontsource.org/). [Locked package versions](package-lock.json) record those dependencies. Architectural sheet numbering, layer tables and redline clouds provide the visual vocabulary; no paper reproduction or external CAD dataset is included.

Written with AI coding assistance.
