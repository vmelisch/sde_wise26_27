<script setup lang="ts">
import { computed } from 'vue'
import type { Value } from '../orders'
import { ARRIVAL, COLS, csvText, DICT, GROUP_SIZE, ROWS, SCRAMBLED } from '../orders'

// The example file at one stage of the lecture's "CSV → Parquet" story:
//   csv       text lines
//   binary    raw values, strings length-prefixed, schema in a footer
//   fixed     strings replaced by dictionary ids: every row has the same size
//   columnar  each column stored contiguously
//   rowgroups columnar inside row groups (PAX)
//   zonemaps  + min/max per row group and column in the footer
//   parquet   + magic bytes and footer length: the real thing
// Every value keeps the data-morph key v<row>-<col> on every stage, so between
// consecutive slides the gsap addon flies each value to its new place.
// Hooks for slide timelines (prefixed: bare names like p7 are UnoCSS utilities):
// values have classes fv-r<row> (row identity), fv-p<pos> (position in the file)
// and fv-c<col>; row groups fv-g<n>; zone-map rows fv-zg<n>; the root's --sat
// (0…1) greys values out and hides their labels. The memory strip above the
// drawing repeats every value in address order, with the same classes, so a
// timeline that dims values shows where the rest lies in the file.
// `pages` (row layouts only) groups every `pages` rows into a page drawn as a
// box (.fv-pg<n>, hooks .fv-page-box and .fv-page-label), as a row store loads
// them; with `pageCol` the label says how many of the page's bytes a query on
// that column uses. Without `pages` the layout is exactly as before.
// `markDict` tints the dictionary in the footer like the country ids that
// point into it (hook .fv-ft-mark); the line keeps its box, so morphs to and
// from an unmarked footer don't move it.
const props = withDefaults(defineProps<{
  stage: 'csv' | 'binary' | 'fixed' | 'columnar' | 'rowgroups' | 'zonemaps' | 'parquet'
  order?: 'scrambled' | 'arrival'
  pages?: number
  pageCol?: number
  markDict?: boolean
}>(), { order: 'scrambled' })
const DICT_TINT = COLS.find(c => c.name === 'country')!.tint

const STAGES = ['csv', 'binary', 'fixed', 'columnar', 'rowgroups', 'zonemaps', 'parquet']
const reached = (s: string) => STAGES.indexOf(props.stage) >= STAGES.indexOf(s)

const U = 7 // px per byte
const M = 1.8 // px per byte in the memory strip

const order = computed(() => (props.order === 'arrival' ? ARRIVAL : SCRAMBLED))
const layout = computed(() =>
  reached('rowgroups') ? 'groups' : reached('columnar') ? 'chunks' : 'rows')
const groups = computed(() =>
  [0, 1, 2].map(g => order.value.slice(g * GROUP_SIZE, (g + 1) * GROUP_SIZE)))
// rows in pages of `pages` rows; without pages, one wrapper that takes no space
const pageRows = computed(() => {
  const n = props.pages ?? order.value.length
  return Array.from({ length: Math.ceil(order.value.length / n) }, (_, p) => order.value.slice(p * n, (p + 1) * n))
})

function bytes(r: number, c: number) {
  const type = COLS[c].type
  if (type === 'DECIMAL(10,2)') return 8 // an INT64 of cents
  if (type === 'STRING' && !reached('fixed')) return 4 + String(ROWS[r][c]).length
  return 4
}

function format(c: number, v: Value) {
  if (props.stage === 'csv') return csvText(c, v)
  if (COLS[c].type === 'DATE') return String(v).slice(5)
  if (COLS[c].type === 'STRING' && reached('fixed')) return `#${DICT.indexOf(String(v))}`
  return csvText(c, v)
}
const label = (r: number, c: number) => format(c, ROWS[r][c])

function pageLabel(p: number) {
  const rows = pageRows.value[p]
  const size = rows.reduce((n, r) => n + COLS.reduce((m, _c, c) => m + bytes(r, c), 0), 0)
  if (props.pageCol == null) return `page ${p}: ${size} B`
  const used = rows.reduce((n, r) => n + bytes(r, props.pageCol!), 0)
  return `page ${p}: ${used} of ${size} B used`
}

const cellStyle = (r: number, c: number) => props.stage === 'csv'
  ? undefined
  : { width: `${bytes(r, c) * U}px`, '--tint': COLS[c].tint }
const cellClass = (r: number, c: number) => [`fv-r${r}`, `fv-c${c}`, `fv-p${order.value.indexOf(r)}`]

// The values in file order, cut where the drawing starts a new line: a row, a
// column chunk or a row group. The strip marks the offset of every cut.
const lines = computed(() => {
  if (layout.value === 'rows') return order.value.map(r => COLS.map((_, c) => [r, c]))
  if (layout.value === 'chunks') return COLS.map((_, c) => order.value.map(r => [r, c]))
  return groups.value.map(rows => COLS.flatMap((_, c) => rows.map(r => [r, c])))
})
// A Parquet file opens with the 4 magic bytes PAR1, so its data starts at 4.
const magic = computed(() => (reached('parquet') ? 4 : 0))
const offsets = computed(() => lines.value.reduce(
  (at, line) => [...at, at.at(-1)! + line.reduce((n, [r, c]) => n + bytes(r, c), 0)], [magic.value]))

const dataBytes = computed(() => {
  if (props.stage === 'csv') {
    const lines = [COLS.map(c => c.name).join(','), ...ROWS.map(row => row.map((v, c) => csvText(c, v)).join(','))]
    return lines.reduce((n, l) => n + l.length + 1, 0)
  }
  return ROWS.reduce((n, _, r) => n + COLS.reduce((m, _c, c) => m + bytes(r, c), 0), 0)
})
const fileName = computed(() =>
  props.stage === 'csv' ? 'orders.csv' : reached('parquet') ? 'orders.parquet' : 'orders.bin')

// min … max of a column within one row group (ISO dates compare fine as text)
function zone(g: number, c: number) {
  const vals = groups.value[g].map(r => ROWS[r][c]).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  return `${format(c, vals[0])} … ${format(c, vals.at(-1)!)}`
}
</script>

<template>
  <div class="fv" :class="`fv--${props.stage}`">
    <div class="fv-head" data-morph="fv-head">
      <b>{{ fileName }}</b>
      <span>{{ dataBytes }} B of data</span>
    </div>
    <div v-if="props.stage !== 'csv'" class="fv-legend" data-morph="fv-legend">
      <span v-for="col in COLS" :key="col.name"><i :style="{ background: col.tint }" />{{ col.name }}</span>
    </div>
    <div v-if="props.stage !== 'csv'" class="fv-mem">
      <div class="fv-mem-title" data-morph="fv-mem-title">bytes in file order</div>
      <div class="fv-mem-bytes">
        <span v-if="magic" class="fv-mem-magic" :style="{ width: `${magic * M}px` }" />
        <span v-for="(line, i) in lines" :key="i" class="fv-mem-line" :class="layout === 'groups' && ['fv-rg', `fv-g${i}`]">
          <span
            v-for="[r, c] in line" :key="`${r}-${c}`" class="fv-cell" :class="cellClass(r, c)"
            :data-morph="`b${r}-${c}`" :style="{ width: `${bytes(r, c) * M}px`, '--tint': COLS[c].tint }"
          />
        </span>
      </div>
      <div class="fv-mem-axis" data-morph="fv-mem-axis" :style="{ width: `${offsets.at(-1)! * M}px` }">
        <span v-for="o in offsets" :key="o" class="fv-mem-tick" :style="{ left: `${o * M}px` }">{{ o }}</span>
      </div>
    </div>
    <div v-if="reached('parquet')" class="fv-magic" data-morph="fv-magic-head">PAR1</div>

    <!-- one line per row -->
    <div v-if="layout === 'rows'" class="fv-rows">
      <div v-if="props.stage === 'csv'" class="fv-row fv-csvhead">
        <span class="fv-rowno" />{{ COLS.map(c => c.name).join(',') }}
      </div>
      <div v-for="(rows, p) in pageRows" :key="p" class="fv-page" :class="props.pages && ['fv-paged', `fv-pg${p}`]">
        <template v-if="props.pages">
          <span class="fv-page-box" />
          <span class="fv-page-label">{{ pageLabel(p) }}</span>
        </template>
        <div v-for="r in rows" :key="r" class="fv-row">
          <span class="fv-rowno">{{ order.indexOf(r) }}</span>
          <template v-for="(col, c) in COLS" :key="col.name">
            <span v-if="props.stage === 'csv' && c > 0" class="fv-sep">,</span>
            <span class="fv-cell" :class="cellClass(r, c)" :data-morph="`v${r}-${c}`" :style="cellStyle(r, c)">
              <span>{{ label(r, c) }}</span>
            </span>
          </template>
        </div>
      </div>
    </div>

    <!-- one chunk per column -->
    <div v-else-if="layout === 'chunks'" class="fv-chunks">
      <div v-for="(col, c) in COLS" :key="col.name" class="fv-chunk" :class="`fv-c${c}`">
        <span v-for="r in order" :key="r" class="fv-cell" :class="cellClass(r, c)" :data-morph="`v${r}-${c}`" :style="cellStyle(r, c)">
          <span>{{ label(r, c) }}</span>
        </span>
      </div>
    </div>

    <!-- row groups, columnar inside -->
    <div v-else class="fv-groups">
      <div v-for="(rows, g) in groups" :key="g" class="fv-rg" :class="`fv-g${g}`">
        <div class="fv-rg-title">row group {{ g }}</div>
        <div class="fv-rg-chunks">
          <div v-for="(col, c) in COLS" :key="col.name" class="fv-chunk" :class="`fv-c${c}`">
            <span v-for="r in rows" :key="r" class="fv-cell" :class="cellClass(r, c)" :data-morph="`v${r}-${c}`" :style="cellStyle(r, c)">
              <span>{{ label(r, c) }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="props.stage !== 'csv'" class="fv-footer">
      <div class="fv-ft-title" data-morph="ft-title">footer (metadata)</div>
      <div data-morph="ft-schema">schema: {{ COLS.map(c => `${c.name} ${c.type}`).join(', ') }}</div>
      <div v-if="reached('fixed')" data-morph="ft-dict">
        <span :class="{ 'fv-ft-mark': props.markDict }" :style="{ '--tint': DICT_TINT }">dictionary country: {{ DICT.map((s, i) => `${i} ${s}`).join(', ') }}</span>
      </div>
      <div v-if="props.stage === 'columnar'" data-morph="ft-index">
        column offsets: created_at 0, product_id 36, country 72, revenue 108
      </div>
      <div v-if="reached('rowgroups')" data-morph="ft-index">
        index: offset + length of every (row group, column) chunk
      </div>
      <table v-if="reached('zonemaps')" class="fv-zones" data-morph="ft-zones">
        <thead><tr><th>row group</th><th>created_at</th><th>product_id</th></tr></thead>
        <tbody>
          <tr v-for="g in [0, 1, 2]" :key="g" :class="`fv-zg${g}`">
            <td>{{ g }}</td><td>{{ zone(g, 0) }}</td><td>{{ zone(g, 1) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="reached('parquet')" class="fv-magic" data-morph="fv-magic-tail">footer length, PAR1</div>
  </div>
</template>

<style scoped>
.fv {
  --sat: 1;
  font-family: var(--slidev-code-font-family);
  font-size: 10px;
  line-height: 1.2;
  color: var(--db-text-soft);
}
.fv-head {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-bottom: 4px;
  font-size: 11px;
}
.fv-head span {
  color: var(--db-text);
}
.fv-legend {
  display: flex;
  gap: 10px;
  margin-bottom: 6px;
  color: var(--db-text);
}
.fv-legend i {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 4px;
  border-radius: 2px;
}
/* memory strip: the data as one byte range, offsets growing to the right */
.fv-mem {
  margin-bottom: 10px;
}
.fv-mem-title {
  margin-bottom: 2px;
  font-size: 9px;
  color: var(--db-text);
}
.fv-mem-bytes,
.fv-mem-line {
  display: flex;
}
.fv-mem .fv-cell,
.fv-mem-magic {
  height: 12px;
  border-radius: 0;
  box-shadow: inset -1px 0 #fff;
}
.fv-mem-magic {
  background: #e4e4e4;
}
.fv-mem-axis {
  position: relative;
  height: 14px;
  border-top: 1px solid var(--db-text);
}
/* arrowhead past the last byte */
.fv-mem-axis::after {
  content: '';
  position: absolute;
  top: -4px;
  right: -14px;
  border: 3.5px solid transparent;
  border-left: 7px solid var(--db-text);
}
.fv-mem-axis::before {
  content: '';
  position: absolute;
  top: -1px;
  right: -8px;
  width: 8px;
  border-top: 1px solid var(--db-text);
}
.fv-mem-tick {
  position: absolute;
  top: -1px;
  padding-top: 4px;
  border-left: 1px solid var(--db-text);
  transform: translateX(-0.5px);
  font-size: 8px;
  line-height: 1;
  color: var(--db-text);
}
.fv-rows,
.fv-chunks,
.fv-groups {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.fv-chunks,
.fv-groups {
  gap: 6px;
}
/* a page wrapper takes no space of its own unless the file is drawn in pages */
.fv-page {
  display: contents;
}
.fv-paged {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: fit-content;
}
/* drawn around the page's rows, outside the layout */
.fv-page-box {
  position: absolute;
  inset: -2px -3px;
  border: 1.5px solid var(--db-text);
  border-radius: 3px;
  pointer-events: none;
}
.fv-page-label {
  position: absolute;
  top: 50%;
  left: calc(100% + 10px);
  transform: translateY(-50%);
  color: var(--db-text);
  white-space: nowrap;
}
.fv-row,
.fv-chunk,
.fv-rg-chunks {
  display: flex;
  align-items: center;
  gap: 2px;
}
.fv-rg-chunks {
  gap: 6px;
}
.fv-rowno {
  width: 14px;
  margin-right: 4px;
  text-align: right;
  color: var(--db-table-rule);
}
.fv--csv .fv-row {
  gap: 0;
}
.fv-csvhead {
  color: var(--db-text);
}
.fv-sep {
  color: var(--db-text);
}
.fv-cell {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  height: 17px;
  overflow: hidden;
  border-radius: 2px;
  font-size: 9px;
  white-space: nowrap;
  background: color-mix(in srgb, var(--tint) calc(var(--sat) * 100%), #e4e4e4);
}
.fv-cell > span {
  opacity: var(--sat);
}
.fv--csv .fv-cell {
  height: auto;
  font-size: 10px;
  background: none;
}
.fv-rg-title {
  margin-bottom: 2px;
  font-size: 9px;
  color: var(--db-text);
}
.fv-magic {
  margin: 4px 0;
  padding: 1px 6px;
  width: fit-content;
  border-radius: 2px;
  background: #e4e4e4;
  font-size: 9px;
}
.fv-footer {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px dashed var(--db-table-rule);
  color: var(--db-text);
}
/* padding outside the text, so the tinted line keeps its place */
.fv-ft-mark {
  margin: 0 -4px;
  padding: 1px 4px;
  border-radius: 2px;
  background: var(--tint);
}
.fv-ft-title {
  font-weight: 700;
  color: var(--db-text-soft);
}
.slidev-layout.db-default .fv-zones {
  margin-top: 4px;
  font-size: 10px;
}
.slidev-layout.db-default .fv-zones :is(th, td) {
  padding: 1px 8px 2px;
}
</style>
