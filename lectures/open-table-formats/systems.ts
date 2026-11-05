// Geometry of the architecture diagrams that join transactions and analytics,
// drawn by components/SysDiagram.vue. After the HTAP deck (01-HTAP-Overview,
// slides 13–18), redrawn in this deck's colours. Fixed geometry in px; the
// right column of a 44fr 56fr slide is 488 px wide.
//
// Conventions, as in LtapArch: arrows show the direction of the data. Ink
// (w) is the write path, teal (p) carries the data over to the analytical
// side, blue (r) is the read path. Badges: W a transaction writing, R an
// analytical query reading. Blue tint = engines and OLTP data, teal tint =
// analytical copies, red tint = a pipeline between systems, grey = services.
//
// `step: 1` marks the analytical side: class sd-s1, which the slide fades in
// on its first click, so each diagram starts with the write path only.
import type { Tint } from './palette'

export type Kind = 'w' | 'p' | 'r'
type Step = { step?: number }

/** box or cylinder (db) at x, y with size w × h; badge (w/r) centred on x, y */
export type Node = Step & {
  x: number
  y: number
  w?: number
  h?: number
  shape?: 'box' | 'db' | 'w' | 'r'
  label?: string
  sub?: string
  tint?: Tint | 'white' // default: grey
}
/** region behind the nodes: dashed outline (group) or tinted band */
export type Area = Step & {
  x: number
  y: number
  w: number
  h: number
  shape: 'group' | 'band'
  label: string
  at?: 'tl' | 'tr' | 'bl' // label corner, default top left
  tint?: Tint
}
/** SVG path, ending at its target's edge (the arrowhead's tip) */
export type Arrow = Step & { d: string, k: Kind, dash?: boolean }
/** text whose centre line is y; starts at x, or is centred on / ends at it */
export type Label = Step & { x: number, y: number, text: string, k: Kind, align?: 'c' | 'e' }

export type Diagram = { w: number, h: number, areas?: Area[], nodes: Node[], arrows: Arrow[], labels?: Label[] }

// one column per compute node; storage underneath. The primary streams its WAL
// to every read node (the route over the replica), and read nodes fetch pages
// from the page servers, which keep them in a durable store.
const shared: Diagram = {
  w: 480,
  h: 306,
  areas: [{ shape: 'band', x: 0, y: 150, w: 480, h: 156, tint: 'yellow', label: 'shared storage', at: 'bl' }],
  nodes: [
    { shape: 'w', x: 65, y: 11 },
    { shape: 'r', x: 415, y: 11, step: 1 },
    { x: 0, y: 44, w: 130, h: 48, label: 'primary', sub: 'row, reads + writes', tint: 'blue' },
    { x: 175, y: 44, w: 130, h: 48, label: 'read replica', sub: 'row, OLTP reads', tint: 'blue', step: 1 },
    { x: 350, y: 44, w: 130, h: 48, label: 'read pool', sub: 'columnar cache', tint: 'blue', step: 1 },
    { x: 10, y: 178, w: 110, h: 52, label: 'log store', sub: 'WAL, replicated', tint: 'white' },
    { x: 185, y: 178, w: 285, h: 52, label: 'page servers', sub: 'replay the WAL, serve pages', tint: 'white' },
    { shape: 'db', x: 270, y: 250, w: 115, h: 48, label: 'pages', sub: 'multi-zone', tint: 'white' },
  ],
  arrows: [
    { d: 'M65 22V44', k: 'w' },
    { d: 'M65 92V178', k: 'w' },
    { d: 'M120 204H185', k: 'w' },
    { d: 'M327 230V250', k: 'w' },
    { d: 'M130 68H175', k: 'p', step: 1 },
    { d: 'M110 44V30H395V44', k: 'p', step: 1 },
    { d: 'M240 178V92', k: 'r', step: 1 },
    { d: 'M415 178V92', k: 'r', step: 1 },
    { d: 'M415 44V22', k: 'r', step: 1 },
  ],
  labels: [
    { x: 73, y: 121, text: 'WAL: commit', k: 'w' },
    { x: 152, y: 192, text: 'WAL', k: 'w', align: 'c' },
    { x: 257, y: 19, text: 'WAL stream', k: 'p', align: 'c', step: 1 },
    { x: 248, y: 135, text: 'pages', k: 'r', step: 1 },
    { x: 423, y: 135, text: 'pages', k: 'r', step: 1 },
  ],
}

// SQL layer on top; a Raft group of row replicas and a columnar learner below
const replicated: Diagram = {
  w: 480,
  h: 300,
  areas: [
    { shape: 'group', x: 0, y: 150, w: 290, h: 150, label: 'Raft group', at: 'tr' },
    { shape: 'group', x: 350, y: 150, w: 130, h: 150, label: 'learner', at: 'tr', step: 1 },
  ],
  nodes: [
    { shape: 'w', x: 45, y: 11 },
    { shape: 'r', x: 380, y: 11, step: 1 },
    { x: 0, y: 44, w: 390, h: 48, label: 'SQL nodes', sub: 'stateless; the optimizer picks row or column', tint: 'blue' },
    { x: 420, y: 44, w: 60, h: 48, label: 'TSO' },
    { shape: 'db', x: 10, y: 180, w: 70, h: 64, label: 'leader', sub: 'row', tint: 'blue' },
    { shape: 'db', x: 110, y: 180, w: 70, h: 64, label: 'follower', sub: 'row' },
    { shape: 'db', x: 210, y: 180, w: 70, h: 64, label: 'follower', sub: 'row' },
    { shape: 'db', x: 362, y: 180, w: 106, h: 64, label: 'columnar', sub: 'no vote', tint: 'teal', step: 1 },
  ],
  arrows: [
    { d: 'M45 22V44', k: 'w' },
    { d: 'M45 92V180', k: 'w' },
    { d: 'M420 68H390', k: 'w' },
    { d: 'M45 244V264H145V244', k: 'w' },
    { d: 'M45 244V264H245V244', k: 'w' },
    { d: 'M290 212H362', k: 'p', dash: true, step: 1 },
    { d: 'M380 180V92', k: 'r', step: 1 },
    { d: 'M380 44V22', k: 'r', step: 1 },
  ],
  labels: [
    { x: 53, y: 128, text: 'writes: 2PC', k: 'w' },
    { x: 145, y: 282, text: 'Raft log: commit on a majority', k: 'w', align: 'c' },
    { x: 320, y: 200, text: 'Raft log', k: 'p', align: 'c', step: 1 },
    { x: 320, y: 225, text: 'async', k: 'p', align: 'c', step: 1 },
    { x: 372, y: 128, text: 'column scan', k: 'r', align: 'e', step: 1 },
  ],
}

// sources on the left, ETL and staging in the middle, the warehouse on the right
const dwh: Diagram = {
  w: 480,
  h: 260,
  nodes: [
    ...[['ERP', 0], ['CRM', 96], ['shop', 192]].flatMap(([label, y]) => [
      { shape: 'w', x: 11, y: Number(y) + 26 } as Node,
      { shape: 'db', x: 44, y: Number(y), w: 84, h: 52, label: String(label), sub: 'OLTP', tint: 'blue' } as Node,
    ]),
    { x: 162, y: 92, w: 86, h: 60, label: 'ETL', sub: 'nightly batch', tint: 'red', step: 1 },
    { shape: 'db', x: 272, y: 96, w: 70, h: 52, label: 'staging', step: 1 },
    { shape: 'db', x: 364, y: 80, w: 90, h: 84, label: 'DWH', sub: 'integrated, history', tint: 'teal', step: 1 },
    { shape: 'db', x: 364, y: 204, w: 90, h: 56, label: 'data marts', tint: 'teal', step: 1 },
    { shape: 'r', x: 409, y: 20, step: 1 },
    { shape: 'r', x: 316, y: 232, step: 1 },
  ],
  arrows: [
    { d: 'M22 26H44', k: 'w' },
    { d: 'M22 122H44', k: 'w' },
    { d: 'M22 218H44', k: 'w' },
    { d: 'M128 26L162 108', k: 'p', dash: true, step: 1 },
    { d: 'M128 122H162', k: 'p', dash: true, step: 1 },
    { d: 'M128 218L162 136', k: 'p', dash: true, step: 1 },
    { d: 'M248 122H272', k: 'p', step: 1 },
    { d: 'M342 122H364', k: 'p', step: 1 },
    { d: 'M409 164V204', k: 'p', step: 1 },
    { d: 'M409 80V31', k: 'r', step: 1 },
    { d: 'M364 232H327', k: 'r', step: 1 },
  ],
  labels: [
    { x: 257, y: 172, text: 'extract → transform → load', k: 'p', align: 'c', step: 1 },
  ],
}

// OLTP system on the left, its analytical copy on the right, CDC in between
const cdc: Diagram = {
  w: 480,
  h: 206,
  nodes: [
    { shape: 'w', x: 70, y: 11 },
    { x: 0, y: 40, w: 140, h: 48, label: 'OLTP DBMS', sub: 'e.g. Postgres', tint: 'blue' },
    { shape: 'db', x: 0, y: 110, w: 140, h: 68, label: 'row store', sub: '+ WAL', tint: 'blue' },
    { x: 170, y: 96, w: 140, h: 64, label: 'CDC', sub: 'Debezium, Kafka', tint: 'red', step: 1 },
    { x: 340, y: 40, w: 140, h: 48, label: 'OLAP engine', sub: 'e.g. ClickHouse', tint: 'blue', step: 1 },
    { shape: 'db', x: 340, y: 110, w: 140, h: 68, label: 'column store', sub: 'or Iceberg table', tint: 'teal', step: 1 },
    { shape: 'r', x: 410, y: 11, step: 1 },
  ],
  arrows: [
    { d: 'M70 22V40', k: 'w' },
    { d: 'M70 88V110', k: 'w' },
    { d: 'M140 140H170', k: 'p', step: 1 },
    { d: 'M310 140H340', k: 'p', step: 1 },
    { d: 'M410 110V88', k: 'r', step: 1 },
    { d: 'M410 40V22', k: 'r', step: 1 },
  ],
  labels: [
    { x: 150, y: 196, text: 'decoded, commit order', k: 'p', align: 'c', step: 1 },
    { x: 330, y: 196, text: 'applied per table', k: 'p', align: 'c', step: 1 },
  ],
}

// the sources on the right, written in place; one engine on the left reads them all
const FED_SOURCES: [string, string | undefined, Tint | undefined, number][] = [
  ['OLTP DB', undefined, 'blue', 26],
  ['DWH', undefined, 'teal', 108],
  ['lake', 'Iceberg', 'yellow', 190],
  ['SaaS API', undefined, undefined, 270],
]
const federation: Diagram = {
  w: 480,
  h: 294,
  nodes: [
    ...FED_SOURCES.flatMap(([label, sub, tint, c], i) => [
      i === 3
        ? { x: 330, y: c - 22, w: 110, h: 44, label, tint } as Node
        : { shape: 'db', x: 330, y: c - 26, w: 110, h: 52, label, sub, tint } as Node,
      { shape: 'w', x: 469, y: c } as Node,
      { x: 210, y: c - 20, w: 90, h: 40, label: 'connector', step: 1 } as Node,
    ]),
    { x: 40, y: 100, w: 130, h: 96, label: 'federated engine', sub: 'plan, push down, join', tint: 'blue', step: 1 },
    { shape: 'r', x: 11, y: 148, step: 1 },
  ],
  arrows: [
    ...FED_SOURCES.flatMap(([, , , c], i) => [
      { d: `M458 ${c}H440`, k: 'w' } as Arrow,
      { d: `M330 ${c}H300`, k: 'r', step: 1 } as Arrow,
      { d: `M210 ${c}L170 ${118 + 20 * i}`, k: 'r', step: 1 } as Arrow,
    ]),
    { d: 'M40 148H22', k: 'r', step: 1 },
  ],
}

export const DIAGRAMS = { shared, replicated, dwh, cdc, federation }
export type DiagramKey = keyof typeof DIAGRAMS
