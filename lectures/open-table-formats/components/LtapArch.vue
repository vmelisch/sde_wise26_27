<script setup lang="ts">
// LTAP as built by Databricks on Lakebase (Neon), after the HTAP deck
// (06-LTAP, slide 34). Left: Postgres and its disaggregated storage, top to
// bottom; right: an analytics engine; below: the object store. Fixed geometry
// in px. Labels sit on white only. All arrows show the direction of the data.
// The arrows themselves are drawn by the slide (useTwo, so they can snake in
// from source to target) between the anchor points la-p-<key>-a and
// la-p-<key>-b; elbow arrows go horizontally first, then vertically. Other
// hooks for the slide timeline: la-l-<key> an arrow's label, la-pq the Parquet
// box, la-en the engine.
const W = 500
const H = 372

// boxes: x, y, w, h
const B = {
  pg: [0, 0, 180, 46],
  sk: [0, 90, 180, 46],
  ps: [0, 180, 180, 46],
  en: [320, 0, 180, 46],
  pi: [12, 286, 168, 44],
  pq: [232, 286, 256, 44],
} as const
const box = (k: keyof typeof B) => {
  const [x, y, w, h] = B[k]
  return { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` }
}

// arrow end points a → b: x, y
const POINTS: Record<string, [number, number, number, number]> = {
  wal: [90, 46, 90, 90],
  stream: [90, 136, 90, 180],
  pages: [90, 226, 90, 286],
  tc: [181, 214, 280, 286], // elbow
  r1: [181, 23, 320, 23],
  r2: [450, 286, 450, 46],
  r3: [181, 196, 340, 46], // elbow
}
const anchors = Object.entries(POINTS).flatMap(([k, [ax, ay, bx, by]]) => [
  { cls: `la-p-${k}-a`, x: ax, y: ay },
  { cls: `la-p-${k}-b`, x: bx, y: by },
])

// labels: key, text, step number (read path), x, y (centre line), align
const LABELS = [
  { key: 'wal', text: 'WAL', x: 98, y: 68 },
  { key: 'stream', text: 'stream', x: 98, y: 158 },
  { key: 'pages', text: 'pages', x: 98, y: 249 },
  { key: 'tc', text: 'transcode', x: 288, y: 249 },
  { key: 'r1', text: 'current LSN', n: 1, x: 250, y: 11, align: 'c' },
  { key: 'r2', text: 'bulk scan', n: 2, x: 442, y: 150, align: 'e' },
  { key: 'r3', text: 'recent changes', n: 3, x: 260, y: 184, align: 'c' },
]
const KIND: Record<string, string> = { wal: 'w', stream: 'w', pages: 'w', tc: 't', r1: 'r', r2: 'r', r3: 'r' }
</script>

<template>
  <div class="la" :style="{ width: `${W}px`, height: `${H}px` }">
    <div class="la-store" />

    <div class="la-box" :style="box('pg')" style="background: var(--tint-blue)">
      Postgres compute<small>transactions</small>
    </div>
    <div class="la-box" :style="box('sk')">
      safekeepers<small>WAL on a quorum: commit</small>
    </div>
    <div class="la-box" :style="box('ps')">
      pageserver<small>replays the WAL</small>
    </div>
    <div class="la-box la-en" :style="box('en')" style="background: var(--tint-blue)">
      analytics engine<small>Lakehouse//RT</small>
    </div>
    <div class="la-box la-page" :style="box('pi')">
      Postgres pages
    </div>
    <div class="la-box la-pq" :style="box('pq')" style="background: var(--tint-teal)">
      Parquet<small>Delta / Iceberg metadata</small>
    </div>

    <i v-for="p in anchors" :key="p.cls" class="la-p" :class="p.cls" :style="{ left: `${p.x}px`, top: `${p.y}px` }" />

    <span
      v-for="l in LABELS" :key="l.key" class="la-lbl"
      :class="[`la-l-${l.key}`, `la-k-${KIND[l.key]}`, l.align && `la-${l.align}`]"
      :style="{ left: `${l.x}px`, top: `${l.y}px` }"
    ><b v-if="l.n">{{ l.n }}</b>{{ l.text }}</span>

    <span class="la-store-lbl" :style="{ left: '0px', top: `${H - 18}px` }"><b>object store</b>: one logical copy, two formats</span>
  </div>
</template>

<style scoped>
.la {
  position: relative;
  font-size: var(--db-fs-small);
  line-height: 1.25;
}
.la > * {
  position: absolute;
}

/* the object store: a band under both representations */
.la-store {
  top: 272px;
  left: 0;
  width: 500px;
  height: 72px;
  border-radius: 6px;
  background: var(--tint-yellow);
}
.la-store-lbl {
  font-size: var(--db-fs-caption);
  white-space: nowrap;
  color: var(--db-text);
}
.la-store-lbl b {
  color: var(--db-text-soft);
}

.la-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  background: #ececec;
  text-align: center;
}
.la-box small {
  display: block;
  color: var(--db-text);
  font-size: var(--db-fs-table);
}
.la-page {
  background: #fff;
}

/* anchor points for the slide's arrows */
.la-p {
  width: 0;
  height: 0;
}

.la-lbl {
  display: flex;
  gap: 4px;
  align-items: center;
  transform: translateY(-50%);
  font-size: var(--db-fs-caption);
  white-space: nowrap;
}
.la-lbl.la-c {
  transform: translate(-50%, -50%);
}
.la-lbl.la-e {
  transform: translate(-100%, -50%);
}
.la-lbl.la-k-w {
  color: var(--db-text);
}
.la-lbl.la-k-t {
  color: var(--db-accent1);
  font-weight: 600;
}
.la-lbl.la-k-r {
  color: var(--db-heading-blue);
}
/* step numbers, as in ByteRanges */
.la-lbl b {
  display: grid;
  place-items: center;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--db-heading-blue);
  font-size: 10px;
  color: #fff;
}
</style>
