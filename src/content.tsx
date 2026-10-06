import type { ReactNode } from 'react';
import type { Station } from './stage/camera';
import { AT } from './blueprint/plans';

export interface Point {
  lead?: string;
  text: string;
}

export interface SectionDef {
  id: string;
  sheet: string;
  rail: string;
  kicker: string;
  title: ReactNode;
  body?: ReactNode;
  points?: Point[];
  numbered?: boolean;
  footer?: ReactNode;
  /** Section height in viewport heights. The first 100vh of it is the camera move. */
  vh: number;
  stations: Station[];
}

const frame = (i: number): Station => ({
  rect: [AT.process.x + i * (AT.process.size + AT.process.gap) - 24, 1610, AT.process.size + 48, 600],
  mode: 'side',
});

export const SECTIONS: SectionDef[] = [
  {
    id: 'top',
    sheet: 'A-000',
    rail: 'Cover',
    kicker: '',
    title: '',
    vh: 100,
    stations: [{ rect: [0, 0, 6000, 4000], mode: 'full' }],
  },
  {
    id: 'problem',
    sheet: 'G-001',
    rail: 'The problem',
    kicker: 'The problem',
    title: (
      <>
        The concept starts with <em>repeated drafting</em>.
      </>
    ),
    points: [
      {
        lead: 'Redrawing by hand.',
        text: 'The house example shows a paper-style sketch beside a clean drawing. Both are rendered from the same authored geometry.',
      },
      {
        lead: 'Rebuilding drawings that already exist.',
        text: 'The PDF-style underlay illustrates a proposed redraw workflow. No permit set is uploaded or read by this page.',
      },
      {
        lead: 'Copy work across a building.',
        text: 'The floor example repeats authored unit templates and adds shared walls and a corridor.',
      },
    ],
    numbered: true,
    footer: 'A visual explanation of a proposed workflow, not a demonstration of AI conversion.',
    vh: 230,
    stations: [
      { rect: [180, 200, 1160, 1020], mode: 'side' },
      { rect: [2620, 260, 2560, 1160], mode: 'side' },
      { rect: [3080, 840, 1500, 680], mode: 'side' },
    ],
  },
  {
    id: 'sketch',
    sheet: 'A-101',
    rail: 'Sketch → CAD',
    kicker: '01 · Sketch → CAD',
    title: (
      <>
        A sketch beside <em>a clean drawing</em>.
      </>
    ),
    body: 'The paper sketch and clean SVG share one house plan. Pencil strokes, walls, door swings and room labels are generated in code; no image model reads the sketch.',
    points: [
      { text: 'Walls as proper objects, exterior and interior on separate layers at consistent thicknesses' },
      { text: 'Doors with their swings, windows set into their walls' },
      { text: 'Room names, furniture and fixtures' },
      { text: 'SVG geometry styled to resemble a layered CAD drawing; no DXF is generated' },
    ],
    vh: 210,
    stations: [
      { rect: [200, 260, 2200, 1040], mode: 'side' },
      { rect: [1350, 300, 1080, 1000], mode: 'side' },
    ],
  },
  {
    id: 'pdf',
    sheet: 'A-201',
    rail: 'PDF → CAD',
    kicker: '02 · PDF → CAD · Architecture',
    title: (
      <>
        A floor plate, <em>assembled</em> from templates.
      </>
    ),
    body: 'Authored unit templates are placed along a corridor. The faint underlay and clean drawing use the same geometry; the animation is not PDF recognition.',
    points: [
      { text: 'Exterior walls, walls between units, partitions, corridors, stairs and elevator cores' },
      { text: 'Doors and windows, set into their walls' },
      { text: 'A PDF-style underlay drawn from the same authored plan, not source-file measurements' },
    ],
    vh: 240,
    stations: [
      { rect: [2640, 300, 1380, 1120], mode: 'side' },
      { rect: [2620, 280, 2560, 1300], mode: 'side' },
    ],
  },
  {
    id: 'mech',
    sheet: 'M-201',
    rail: 'Mechanical',
    kicker: '02 · PDF → CAD · Mechanical',
    title: (
      <>
        HVAC illustrated on <em>separate layers</em>.
      </>
    ),
    body: 'The example adds authored duct runs, equipment, grilles and dampers. Sizes, airflow and tags are synthetic display values, not extracted specifications.',
    points: [
      { text: 'Ducts carry their size and length' },
      { text: 'Equipment carries its tag, type and airflow' },
      { text: 'A sample take-off table, with lengths calculated from the authored duct paths; no spreadsheet is exported' },
    ],
    vh: 200,
    stations: [
      { rect: [2690, 880, 1240, 720], mode: 'side' },
      { rect: [2640, 300, 2540, 1300], mode: 'side' },
    ],
  },
  {
    id: 'parking',
    sheet: 'P-101',
    rail: 'Parking',
    kicker: '02 · PDF → CAD · Parking',
    title: (
      <>
        Every stall, <em>numbered</em> and typed.
      </>
    ),
    body: 'A synthetic parking layout shows walls, columns and numbered stalls. Small, medium, EV and accessible labels illustrate the proposed output; they are not inferred from a drawing.',
    vh: 170,
    stations: [{ rect: [120, 1560, 2460, 1940], mode: 'side' }],
  },
  {
    id: 'how',
    sheet: 'G-501',
    rail: 'Proposed workflow',
    kicker: 'Proposed workflow',
    title: (
      <>
        A proposed pipeline, <em>drawn</em> in stages.
      </>
    ),
    points: [
      { lead: 'Read.', text: 'A future converter would identify sheets, scale, legends and unit types. This page does not read files.' },
      {
        lead: 'Understand.',
        text: 'Coloured SVG drawings illustrate structural categories. No image model runs here.',
      },
      { lead: 'Measure.', text: 'Local geometry helpers split authored walls around openings and place door swings.' },
      {
        lead: 'Assemble.',
        text: 'The example composes unit templates, common areas and mechanical layers into one SVG sheet.',
      },
      { lead: 'Check.', text: 'Scripted review cards illustrate a human review step; no uncertainty detector is implemented.' },
    ],
    numbered: true,
    footer: 'Only the SVG geometry and frontend animation are implemented in this repository.',
    vh: 360,
    stations: [{ rect: [2640, 1560, 2520, 760], mode: 'side' }, frame(0), frame(1), frame(2), frame(3), frame(4)],
  },
  {
    id: 'output',
    sheet: 'G-601',
    rail: 'Output concept',
    kicker: 'Output concept',
    title: (
      <>
        An illustration of <em>possible outputs</em>.
      </>
    ),
    points: [
      { lead: 'Layers.', text: 'A sample layer table shows how a CAD export could be organised. This page renders SVG only.' },
      { lead: 'Objects.', text: 'Authored ducts and equipment carry example sizes, tags and airflow values.' },
      { lead: 'Take-offs.', text: 'Duct lengths come from the synthetic paths; equipment quantities are illustrative.' },
      { lead: 'Review pictures.', text: 'Synthetic before/after thumbnails and scripted exceptions show a proposed review interface.' },
    ],
    vh: 240,
    stations: [
      { rect: [2660, 2370, 860, 840], mode: 'side' },
      { rect: [3530, 2370, 860, 760], mode: 'side' },
      { rect: [4290, 2370, 850, 800], mode: 'side' },
    ],
  },
  {
    id: 'who',
    sheet: 'G-701',
    rail: "Who it's for",
    kicker: "Who it's for",
    title: (
      <>
        Issued for the people who <em>draw</em>.
      </>
    ),
    points: [
      { lead: 'Architecture firms.', text: 'Concept sketch to CAD, existing-conditions drawings.' },
      { lead: 'MEP and HVAC engineers.', text: 'Mechanical layers and take-offs from PDF sets.' },
      { lead: 'Contractors and estimators.', text: 'Quantities straight from the drawings.' },
      { lead: 'Developers and owners.', text: 'Digitising PDF-only buildings.' },
      { lead: 'CAD drafting services.', text: 'A proposed workflow for repetitive drafting; no time savings measured here.' },
    ],
    vh: 160,
    stations: [{ rect: [5270, 1150, 620, 680], mode: 'side' }],
  },
  {
    id: 'status',
    sheet: 'G-801',
    rail: 'Prototype status',
    kicker: 'Prototype status',
    title: (
      <>
        Built from <em>authored</em> examples.
      </>
    ),
    body: 'This repository contains a working landing-page frontend with synthetic house, floor, mechanical and parking drawings. It does not include client sketches, a permit-set dataset, a conversion backend or measured conversion results.',
    points: [
      { lead: 'Geometry.', text: 'The house sketch and clean drawing use the same plan; floor and parking scenes use authored layouts.' },
      { lead: 'Presentation.', text: 'Scroll-driven camera moves, layer reveals, theme switching and a scripted dashboard are implemented.' },
      { lead: 'Not included.', text: 'AI inference, drawing ingestion, DXF writing and spreadsheet export.' },
    ],
    vh: 210,
    stations: [
      { rect: [200, 3450, 1320, 480], mode: 'side' },
      { rect: [5270, 1780, 620, 1000], mode: 'side' },
    ],
  },
  {
    id: 'dashboard',
    sheet: 'A-900',
    rail: 'Dashboard',
    kicker: 'Dashboard concept',
    title: (
      <>
        A dashboard, <em>illustrated</em>.
      </>
    ),
    body: 'A scripted cursor toggles drawing layers, marks an example review item and shows an export notification. No file is uploaded, processed or downloaded. The controls are static presentation markup.',
    vh: 220,
    stations: [{ rect: [0, 0, 6000, 4000], mode: 'app' }],
  },
  {
    id: 'access',
    sheet: 'A-000',
    rail: 'Early access',
    kicker: 'Request early access',
    title: (
      <>
        Ask about <em>the concept</em>.
      </>
    ),
    body: 'This optional contact form sends your details only when an external endpoint is configured. It does not upload or convert drawings.',
    vh: 150,
    stations: [{ rect: [0, 0, 6000, 4000], mode: 'app' }],
  },
];
