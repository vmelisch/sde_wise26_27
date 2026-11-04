<script setup lang="ts">
import type { Tint } from '../palette'
import { TINT } from '../palette'

// The byte ranges a reader fetches from the 10 GB orders.parquet of the data
// lake slides: 20 row groups of 512 MB, a 1.2 MB footer, then 8 bytes (footer
// length, PAR1). Drawn as FileView's memory strip, but not to scale: widths
// are px. A segment fetched by request n gets a bracket above it; `at` puts
// its start offset on the axis below. Hooks for timelines: request n's bracket
// has class br-r<n>, the segment it fetches br-s<n>.
type Seg = {
  w: number
  fill?: 'magic' | 'rg' | 'gap' | 'footer' | 'tail'
  tint?: Tint
  label?: string
  at?: string
  read?: number
  size?: string
}

// rg n: three column chunks, revenue (fetched by request `read`), the rest
function rowGroup(n: number, at: string, read: number): Seg[] {
  return [
    { w: 13, tint: 'blue', at },
    { w: 13, tint: 'purple' },
    { w: 13, tint: 'yellow' },
    { w: 13, tint: 'teal', read, size: '4 MB' },
    { w: 62, fill: 'rg', label: `rg ${n}` },
  ]
}

const SEGS: Seg[] = [
  { w: 14, fill: 'magic', at: '0' },
  { w: 70, fill: 'rg', label: 'rg 0' },
  { w: 22, fill: 'gap' }, // rg 1 to rg 16
  ...rowGroup(17, '8.5 GB', 3),
  ...rowGroup(18, '9 GB', 4),
  { w: 70, fill: 'rg', label: 'rg 19', at: '9.5 GB' },
  { w: 96, fill: 'footer', label: 'footer', at: '10 GB', read: 2, size: '1.2 MB' },
  { w: 18, fill: 'tail', read: 1, size: '8 B' },
]

const segStyle = (s: Seg) => ({ width: `${s.w}px`, background: s.tint && TINT[s.tint] })
</script>

<template>
  <div class="br">
    <div class="br-row br-reads">
      <span v-for="(s, i) in SEGS" :key="i" :style="{ width: `${s.w}px` }">
        <span v-if="s.read" class="br-bracket" :class="`br-r${s.read}`">
          <span class="br-req"><b>{{ s.read }}</b>{{ s.size }}</span>
        </span>
      </span>
    </div>
    <div class="br-row br-bytes">
      <span
        v-for="(s, i) in SEGS" :key="i" class="br-seg"
        :class="[s.fill && `br-${s.fill}`, s.read && `br-s${s.read}`, { 'br-unread': s.tint && !s.read }]" :style="segStyle(s)"
      >{{ s.fill === 'gap' ? '≈' : s.label }}</span>
    </div>
    <div class="br-row br-axis">
      <span v-for="(s, i) in SEGS" :key="i" :class="{ 'br-break': s.fill === 'gap' }" :style="{ width: `${s.w}px` }">
        <span v-if="s.at" class="br-tick">{{ s.at }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.br {
  width: fit-content;
  font-family: var(--slidev-code-font-family);
  font-size: 9px;
  line-height: 1;
  color: var(--db-text);
}
.br-row {
  display: flex;
}
.br-row > span {
  position: relative;
  flex: none;
}

/* requests: a bracket over the fetched range, number and size above it */
.br-reads {
  height: 22px;
}
.br-bracket {
  position: absolute;
  inset: auto 1px 2px;
  height: 5px;
  border: 1.5px solid var(--db-text-soft);
  border-bottom: none;
}
.br-req {
  position: absolute;
  bottom: 8px;
  left: 50%;
  display: flex;
  gap: 3px;
  align-items: center;
  transform: translateX(-50%);
  white-space: nowrap;
  color: var(--db-text-soft);
}
.br-req b {
  display: grid;
  place-items: center;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--db-text-soft);
  font-size: 8px;
  color: #fff;
}

/* the file */
.br-seg {
  display: grid;
  place-items: center;
  height: 20px;
  overflow: hidden;
  white-space: nowrap;
  box-shadow: inset -1px 0 #fff;
}
.br-rg {
  background: #f0f0f0;
}
.br-magic,
.br-footer {
  background: #e4e4e4;
}
.br-footer {
  color: var(--db-text-soft);
}
.br-tail {
  background: var(--db-table-rule);
}
.br-gap {
  color: var(--db-table-rule);
  font-size: 12px;
}
.br-unread {
  opacity: 0.35;
}

/* offset axis, broken where row groups are left out */
.br-axis {
  margin-right: 14px;
  height: 14px;
}
.br-axis > span {
  border-top: 1px solid var(--db-text);
}
.br-axis > .br-break {
  border-top-style: dashed;
}
.br-axis > :last-child::after {
  content: '';
  position: absolute;
  top: -1px;
  left: 100%;
  width: 7px;
  border-top: 1px solid var(--db-text);
}
.br-axis > :last-child::before {
  content: '';
  position: absolute;
  top: -4px;
  left: calc(100% + 7px);
  border: 3.5px solid transparent;
  border-left: 7px solid var(--db-text);
}
.br-tick {
  position: absolute;
  top: -1px;
  left: -0.5px;
  padding-top: 4px;
  border-left: 1px solid var(--db-text);
  font-size: 8px;
  white-space: nowrap;
}
</style>
