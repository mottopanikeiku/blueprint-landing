# [Product]: landing page

The landing page for **[Product]**, which turns hand sketches and PDF drawing sets into layered CAD.

The whole page is one architectural blueprint sheet (A-000). Scrolling moves a camera across the sheet, and each stop
tells one part of the story. CAD output draws itself in as you go:

| Sheet | Section | On the drawing |
|---|---|---|
| A-000 | Cover | Full sheet, hero copy |
| G-001 | The problem | Redline clouds over the sketch, the PDF-only floor plate and the repeated units |
| A-101 | Sketch → CAD | A taped paper sketch, then the clean layered CAD drawing beside it |
| A-201 | PDF → CAD | PDF underlay, unit types recognised and copied, walls merged and drawn |
| M-201 | Mechanical | Ductwork, fan coils, grilles and dampers, with smart-object callouts |
| P-101 | Parking | Columns, ramp, and every stall numbered and typed |
| G-501 | How it works | Five detail frames: Read, Understand, Measure, Assemble, Check |
| G-601 | What you get | Layer table, take-off schedule, review exceptions |
| G-701 | Who it's for | The "Issued for" box in the title block |
| G-801 | Why now · Status | General notes, then the revisions table |
| A-900 | Dashboard | The camera pulls back and the sheet turns out to be on a monitor running the product |
| A-000 | Early access | Request form beside the monitor |

All drawings are generated in code from small plan definitions (`src/blueprint/plans.ts`). There are no image assets.
The pencil sketch, the CAD and the PDF underlay all come from the same plan geometry.

## Stack

- Vite, React 19, TypeScript
- GSAP ScrollTrigger for the scroll-scrubbed reveals. Lenis for smooth scrolling (turned off when the user prefers
  reduced motion).
- Fonts are self-hosted with Fontsource. Archivo, a variable font, is the brand face: its expanded width (125%) is used
  for display type and its normal width for body text. IBM Plex Mono is used for drawing text, and Caveat for the
  handwriting on the sketch.
- Brand mark (`src/components/Brand.tsx`): a CAD endpoint-snap marker, meaning snapped to the source and exact. The
  red-orange accent (`--accent`) is redline red.

## Run it

```sh
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check, then build to dist/
npm run preview   # serve dist/
```

## Early access form

The form sends JSON (`name`, `email`, `firm`, `role`, `drawings[]`) by `POST` to the URL in
`VITE_EARLY_ACCESS_ENDPOINT`. Any endpoint that accepts JSON will work, for example a Formspree form, a serverless
function or a CRM webhook.

```sh
cp .env.example .env.local
# then set VITE_EARLY_ACCESS_ENDPOINT=https://formspree.io/f/xxxxxxx
```

If the variable is not set, the form says it is not connected instead of pretending the request went through.

## Where things live

```
src/
  content.tsx            section copy + camera stations (which part of the sheet each section frames)
  stage/camera.ts        camera math: fitting a sheet rectangle into the free part of the screen, monitor pull-back
  stage/choreography.ts  scroll timelines: camera path + per-section reveals
  blueprint/             the sheet itself
    plans.ts             plan data: house sketch, floor plate, units, ductwork, parking, sheet layout
    geometry.ts          wall/opening resolution, transforms, pencil strokes, revision clouds
    cad.tsx              CAD renderer (walls, doors, windows, fixtures, labels), detail titles
    Sketch.tsx  Floor.tsx  Parking.tsx  Process.tsx  Schedules.tsx  TitleBlock.tsx  Blueprint.tsx
  components/            dashboard chrome shown inside the monitor, early-access form
```

To change copy, edit `src/content.tsx`. To reframe a section, change its `stations` rectangles. These are in sheet
units, and the sheet is 6000 × 4000.

`[Product]` is a placeholder everywhere. Search for it when the name is decided.
