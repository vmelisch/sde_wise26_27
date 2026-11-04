<script setup lang="ts">
// Which system for what: architectures by how tightly they are coupled (x)
// and what an analytical query sees of the latest commits (y). After the HTAP
// deck (01-HTAP-Overview, slide 26), reduced to the systems of this lecture;
// the y levels are its freshness ladder L0–L5, spelled out. Fixed geometry in
// px; arrows in one SVG on the same coordinates. Hook for the slide timeline:
// sm-ltap (LTAP and the step that leads to it).
const COL_X = [245, 425, 605, 775] // centres of the four x categories
const ROW_H = 44
const PLOT_H = 6 * ROW_H
const rowY = (level: number) => (5 - level) * ROW_H + ROW_H / 2 // centre of level 0…5

const X_LABELS = ['one engine', 'n engines, one system', 'n systems, copies', 'open lake']
const Y_LABELS = ['no guarantee', 'last batch load', 'seconds behind', 'own writes', 'fresh snapshot', 'same transaction']

type Sys = { name: string, ex: string, col: number, level: number, tint: string, cls?: string }
const SYSTEMS: Sys[] = [
  { name: 'single DBMS', ex: 'Postgres, HyPer', col: 0, level: 5, tint: 'blue' },
  { name: 'replicated', ex: 'TiDB', col: 1, level: 4, tint: 'blue' },
  { name: 'shared storage', ex: 'Aurora, Neon', col: 1, level: 3, tint: 'blue' },
  { name: 'CDC', ex: 'Debezium, zero-ETL', col: 2, level: 2, tint: 'red' },
  { name: 'DWH + ETL', ex: 'nightly loads', col: 2, level: 1, tint: 'red' },
  { name: 'data lake', ex: 'Parquet on S3', col: 3, level: 0, tint: 'purple' },
  { name: 'lakehouse', ex: 'Iceberg, Delta Lake', col: 3, level: 1.5, tint: 'purple' },
  { name: 'LTAP (claimed)', ex: 'Lakebase', col: 3, level: 4, tint: 'purple', cls: 'sm-ltap sm-claimed' },
]
const CHIP_W = 150
const CHIP_H = 38

const chipStyle = (s: Sys) => ({
  left: `${COL_X[s.col] - CHIP_W / 2}px`,
  top: `${rowY(s.level) - CHIP_H / 2}px`,
  width: `${CHIP_W}px`,
  height: `${CHIP_H}px`,
  background: `var(--tint-${s.tint})`,
})

// lake steps: data lake → lakehouse → LTAP, along the right column
const lakeX = COL_X[3]
const up = (from: number, to: number) => `M${lakeX} ${rowY(from) - CHIP_H / 2 - 2}V${rowY(to) + CHIP_H / 2 + 3}`
</script>

<template>
  <div class="sm" :style="{ height: `${PLOT_H + 34}px` }">
    <svg class="sm-lines" viewBox="0 0 900 320" width="900" height="320">
      <defs>
        <marker id="sm-h" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto">
          <path class="sm-head" d="M0 0.5L7.5 4L0 7.5z" />
        </marker>
        <marker id="sm-hb" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto">
          <path class="sm-head-b" d="M0 0.5L7.5 4L0 7.5z" />
        </marker>
        <marker id="sm-hp" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto">
          <path class="sm-head-p" d="M0 0.5L7.5 4L0 7.5z" />
        </marker>
      </defs>
      <!-- axes -->
      <path class="sm-axis" :d="`M160 ${PLOT_H + 4}V2`" marker-end="url(#sm-h)" />
      <path class="sm-axis" :d="`M160 ${PLOT_H + 4}H898`" marker-end="url(#sm-h)" />
      <!-- inside one DBMS: isolating the workloads costs a little freshness -->
      <path class="sm-step sm-step-b" :d="`M${COL_X[0] + CHIP_W / 2 + 4} ${rowY(5)}L${COL_X[1] - CHIP_W / 2 + 10} ${rowY(4) - CHIP_H / 2 - 3}`" marker-end="url(#sm-hb)" />
      <!-- the lake climbs: + table format, + OLTP storage -->
      <path class="sm-step sm-step-p" :d="up(0, 1.5)" marker-end="url(#sm-hp)" />
      <path class="sm-step sm-step-p sm-ltap" :d="up(1.5, 4)" marker-end="url(#sm-hp)" />
    </svg>

    <span v-for="(l, i) in Y_LABELS" :key="l" class="sm-y" :style="{ top: `${rowY(i)}px` }">{{ l }}</span>
    <span v-for="(l, i) in X_LABELS" :key="l" class="sm-x" :style="{ left: `${COL_X[i]}px`, top: `${PLOT_H + 12}px` }">{{ l }}</span>

    <div v-for="s in SYSTEMS" :key="s.name" class="sm-chip" :class="s.cls" :style="chipStyle(s)">
      {{ s.name }}<small>{{ s.ex }}</small>
    </div>

    <span class="sm-note sm-note-b" :style="{ left: `${COL_X[0]}px`, top: `${rowY(5) + CHIP_H / 2 + 6}px` }">isolate workloads</span>
    <span class="sm-note sm-note-p" :style="{ left: `${lakeX + 10}px`, top: `${(rowY(0) + rowY(1.5)) / 2}px` }">+ table format</span>
    <span class="sm-note sm-note-p sm-ltap" :style="{ left: `${lakeX + 10}px`, top: `${(rowY(1.5) + rowY(4)) / 2}px` }">+ OLTP storage</span>
  </div>
</template>

<style scoped>
.sm {
  position: relative;
  width: 900px;
  font-size: var(--db-fs-small);
  line-height: 1.2;
}
.sm > * {
  position: absolute;
}
.sm-lines {
  top: 0;
  left: 0;
  overflow: visible;
  fill: none;
  stroke-width: 1.5;
}
.sm-axis {
  stroke: var(--db-text);
}
.sm-head {
  fill: var(--db-text);
}
.sm-step {
  stroke-dasharray: 5 4;
}
.sm-step-b {
  stroke: var(--db-heading-blue);
}
.sm-head-b {
  fill: var(--db-heading-blue);
}
.sm-step-p {
  stroke: var(--db-accent6);
}
.sm-head-p {
  fill: var(--db-accent6);
}

.sm-y {
  left: 0;
  width: 148px;
  transform: translateY(-50%);
  text-align: right;
  font-size: var(--db-fs-caption);
  color: var(--db-text);
}
.sm-x {
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: var(--db-fs-caption);
  font-weight: 600;
}

.sm-chip {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  text-align: center;
}
.sm-chip small {
  color: var(--db-text);
  font-size: var(--db-fs-table);
}
.sm-claimed {
  outline: 1.5px dashed var(--db-accent6);
  outline-offset: -1.5px;
}

.sm-note {
  font-size: var(--db-fs-caption);
  font-style: italic;
  white-space: nowrap;
}
.sm-note-b {
  transform: translateX(-30%);
  color: var(--db-heading-blue);
}
.sm-note-p {
  transform: translateY(-50%);
  color: var(--db-accent6);
}
</style>
