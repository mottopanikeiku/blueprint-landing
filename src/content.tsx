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
        Most of the hours go to <em>drafting</em>, not design.
      </>
    ),
    points: [
      {
        lead: 'Redrawing by hand.',
        text: 'A plan sketched on paper or a tablet becomes hours of tracing into AutoCAD: walls, doors, windows, fixtures, layers, line weights.',
      },
      {
        lead: 'Rebuilding drawings that already exist.',
        text: 'When all you have is a PDF permit set or old record drawings, someone redraws every wall, door and duct, floor by floor.',
      },
      {
        lead: 'Copy work across a building.',
        text: 'Hundreds of units built from a few dozen types. Every copy, every shared wall and every corridor drawn and checked by hand.',
      },
    ],
    numbered: true,
    footer: 'Skilled, slow and repetitive. Exactly the kind of work AI can now do.',
    vh: 280,
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
        A photo of a sketch in. <em>A layered DXF</em> out.
      </>
    ),
    body: 'The AI reads the sketch the way an architect would: what is a wall, a door, a window, a piece of furniture. Then deterministic geometry code makes it exact. Straight walls, square corners, closed rooms.',
    points: [
      { text: 'Walls as proper objects, exterior and interior on separate layers at consistent thicknesses' },
      { text: 'Doors with their swings, windows set into their walls' },
      { text: 'Room names, furniture and fixtures' },
      { text: 'A standard layered DXF that opens directly in AutoCAD' },
    ],
    vh: 260,
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
        A permit set in. <em>Every floor</em> out, layered.
      </>
    ),
    body: 'The set is read sheet by sheet. Unit types are recognised once and placed on every copy, then shared walls between neighbours are merged into single walls.',
    points: [
      { text: 'Exterior walls, walls between units, partitions, corridors, stairs and elevator cores' },
      { text: 'Doors and windows, set into their walls' },
      { text: "Every wall placed on the PDF's own lines: exact, not traced by eye" },
    ],
    vh: 300,
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
        HVAC on its own layers, as <em>smart objects</em>.
      </>
    ),
    body: 'Ductwork, equipment, fans, grilles, wall caps and dampers, each on its own industry-standard layer. Duct sizes and equipment tags are read and attached as real text.',
    points: [
      { text: 'Ducts carry their size and length' },
      { text: 'Equipment carries its tag, type and airflow' },
      { text: 'Every duct run and every piece of equipment, out as a take-off spreadsheet' },
    ],
    vh: 260,
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
    body: 'Parking levels come out with walls, columns and every parking stall, each with its number and size: small, medium, EV or accessible.',
    vh: 220,
    stations: [{ rect: [120, 1560, 2460, 1940], mode: 'side' }],
  },
  {
    id: 'how',
    sheet: 'G-501',
    rail: 'How it works',
    kicker: 'How it works',
    title: (
      <>
        AI reads. <em>Geometry</em> measures.
      </>
    ),
    points: [
      { lead: 'Read.', text: 'AI reads the drawing: what each sheet is, the scale, the legend, which units are which types.' },
      {
        lead: 'Understand.',
        text: 'An image model redraws each part as a clean, colour-coded structure drawing: walls, doors, windows and fixtures each in their own colour.',
      },
      { lead: 'Measure.', text: "Geometry code turns that drawing into exact objects and snaps them to the source's own lines." },
      {
        lead: 'Assemble.',
        text: 'Units, shared walls, common areas and mechanical systems are joined into one CAD file per floor.',
      },
      { lead: 'Check.', text: 'Automatic checks flag anything uncertain, with pictures, for a quick human look.' },
    ],
    numbered: true,
    footer: 'AI does the reading and judgement. Deterministic code does the precise geometry. That is what makes the output real CAD, not a picture of a plan.',
    vh: 440,
    stations: [{ rect: [2640, 1560, 2520, 760], mode: 'side' }, frame(0), frame(1), frame(2), frame(3), frame(4)],
  },
  {
    id: 'output',
    sheet: 'G-601',
    rail: 'What you get',
    kicker: 'What you get',
    title: (
      <>
        Files your office <em>already</em> uses.
      </>
    ),
    points: [
      { lead: 'Layers.', text: 'Standard DXF with professional layer naming. No new software to learn.' },
      { lead: 'Smart objects.', text: 'Ducts with size and length. Equipment with tag, type and airflow.' },
      { lead: 'Take-offs.', text: 'Every duct run and every piece of equipment, as a spreadsheet.' },
      { lead: 'Review pictures.', text: 'Before/after images and a short list of exceptions, so a person reviews instead of redrawing.' },
    ],
    vh: 300,
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
      { lead: 'CAD drafting services.', text: 'The same work at a fraction of the hours.' },
    ],
    vh: 190,
    stations: [{ rect: [5270, 1150, 620, 680], mode: 'side' }],
  },
  {
    id: 'status',
    sheet: 'G-801',
    rail: 'Why now · Status',
    kicker: 'Why now · Status',
    title: (
      <>
        Built on <em>real</em> projects.
      </>
    ),
    body: 'Image AI can finally read and redraw technical drawings, but on its own it is not precise enough for CAD. We pair it with geometry code that is, and test it on real work: hand sketches from working architects, and a full 20-sheet mechanical permit set for a 186-unit residential building.',
    points: [
      { lead: 'Sketch → CAD.', text: 'Working end to end on real client sketches.' },
      {
        lead: 'PDF → CAD.',
        text: 'One full floor built (walls, doors, windows, mechanical) plus all three parking levels. Extending to every floor of the building now.',
      },
      { lead: 'Next.', text: 'Electrical, plumbing and more building types.' },
    ],
    vh: 260,
    stations: [
      { rect: [200, 3450, 1320, 480], mode: 'side' },
      { rect: [5270, 1780, 620, 1000], mode: 'side' },
    ],
  },
  {
    id: 'dashboard',
    sheet: 'A-900',
    rail: 'Dashboard',
    kicker: 'Coming next · The dashboard',
    title: (
      <>
        Upload a file. <em>Download the CAD.</em>
      </>
    ),
    body: 'Everything on this sheet comes out of one run. Next is a web dashboard where you drop in a sketch or a PDF set and get back layered CAD, take-offs and a short review list. It is in development now, shaped by early-access firms.',
    vh: 240,
    stations: [{ rect: [0, 0, 6000, 4000], mode: 'app' }],
  },
  {
    id: 'access',
    sheet: 'A-000',
    rail: 'Early access',
    kicker: 'Request early access',
    title: (
      <>
        Put your drawings <em>on the sheet</em>.
      </>
    ),
    vh: 150,
    stations: [{ rect: [0, 0, 6000, 4000], mode: 'app' }],
  },
];
