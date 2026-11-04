<script setup lang="ts">
import type { Tint } from '../palette'
import { TINT } from '../palette'

// One row of a compression figure: values as tinted cells, drawn like
// FileView's. `null` is a hatched NULL slot. With `w` every cell is w px wide
// and `spans` stretches cell i over spans[i] slots, so a row of runs lines up
// under the values it replaces. `caption` goes above the row, `note` to its
// right. Hooks for timelines: the root has class cl, cell i class cl-i<i>.
const props = withDefaults(defineProps<{
  vals: (string | number | null)[]
  tint?: Tint
  w?: number
  spans?: number[]
  caption?: string
  note?: string
}>(), { tint: 'blue' })

const GAP = 2 // px between cells, as in .cl-row

function width(i: number) {
  if (!props.w) return undefined
  const n = props.spans?.[i] ?? 1
  return `${n * (props.w + GAP) - GAP}px`
}
</script>

<template>
  <div class="cl" :style="{ '--tint': TINT[props.tint] }">
    <div v-if="props.caption" class="cl-caption">{{ props.caption }}</div>
    <div class="cl-row">
      <span
        v-for="(v, i) in props.vals"
        :key="i"
        class="cl-cell"
        :class="[`cl-i${i}`, { 'cl-null': v === null, 'cl-fixed': props.w }]"
        :style="{ width: width(i) }"
      >{{ v ?? 'NULL' }}</span>
      <span v-if="props.note" class="cl-note">{{ props.note }}</span>
    </div>
  </div>
</template>

<style scoped>
.cl {
  font-family: var(--slidev-code-font-family);
  font-size: 10px;
  line-height: 1.2;
  color: var(--db-text-soft);
}
.cl-caption {
  margin-bottom: 3px;
  font-size: 10px;
  color: var(--db-text);
}
.cl-row {
  display: flex;
  align-items: center;
  gap: 2px;
}
.cl-cell {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  height: 20px;
  padding: 0 4px;
  border-radius: 2px;
  font-size: 10px;
  white-space: nowrap;
  background: var(--tint);
}
/* a fixed width already leaves room around the text */
.cl-fixed {
  padding: 0;
}
.cl-null {
  color: var(--db-text);
  background: repeating-linear-gradient(45deg, #ececec, #ececec 3px, #dcdcdc 3px, #dcdcdc 4px);
}
.cl-note {
  margin-left: 8px;
  color: var(--db-text);
  white-space: nowrap;
}
</style>
