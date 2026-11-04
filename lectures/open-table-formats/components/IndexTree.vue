<script setup lang="ts">
import { computed } from 'vue'
import { TINT } from '../palette'
import { COLS, ROWS, SCRAMBLED } from '../orders'

// An external (secondary) index on one column of the example file, drawn as a
// two-level B+-tree: a root of separator keys over leaves of `fanout` entries,
// each a key and the positions of its rows in the file. Positions follow the
// file's scrambled row order, so they match FileView's fv-p<pos> classes.
// Hooks for timelines: leaf entry k (in key order) has class ix-k<k>.
const props = withDefaults(defineProps<{
  col?: number
  fanout?: number
}>(), { col: 0, fanout: 3 })

const col = computed(() => COLS[props.col])

// key → row positions, in key order
const entries = computed(() => {
  const at = new Map<string, number[]>()
  SCRAMBLED.forEach((r, p) => {
    const key = String(ROWS[r][props.col])
    at.set(key, [...(at.get(key) ?? []), p])
  })
  return [...at].sort(([a], [b]) => (a < b ? -1 : 1)).map(([key, pos], k) => ({ key, pos, k }))
})
const leaves = computed(() => {
  const out: (typeof entries.value)[] = []
  for (let i = 0; i < entries.value.length; i += props.fanout)
    out.push(entries.value.slice(i, i + props.fanout))
  return out
})
const separators = computed(() => leaves.value.slice(1).map(l => l[0].key))

// dates as in FileView: month-day
const show = (key: string) => (col.value.type === 'DATE' ? key.slice(5) : key)
</script>

<template>
  <div class="ix" :style="{ '--tint': col.tint }">
    <div class="ix-caption">external index on {{ col.name }}: key → row positions</div>
    <div class="ix-body">
      <div class="ix-node ix-root">
        <span v-for="s in separators" :key="s" class="ix-sep">{{ show(s) }}</span>
      </div>
      <div class="ix-edges" :style="{ margin: `8px ${50 / leaves.length}% 0` }" />
      <div class="ix-leaves" :style="{ gridTemplateColumns: `repeat(${leaves.length}, 1fr)` }">
        <div v-for="(leaf, n) in leaves" :key="n" class="ix-cell">
          <div class="ix-node">
            <span v-for="e in leaf" :key="e.key" class="ix-entry" :class="`ix-k${e.k}`">
              {{ show(e.key) }}<small>{{ e.pos.join(',') }}</small>
            </span>
            <span v-for="i in props.fanout - leaf.length" :key="`empty${i}`" class="ix-entry ix-empty" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ix {
  font-family: var(--slidev-code-font-family);
  font-size: 10px;
  line-height: 1.2;
  color: var(--db-text-soft);
}
.ix-caption {
  margin-bottom: 4px;
  color: var(--db-text);
}
.ix-body {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}
.ix-node {
  display: flex;
  gap: 2px;
  padding: 2px;
  border: 1.5px solid var(--db-table-rule);
  border-radius: 3px;
}
.ix-sep,
.ix-entry {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  border-radius: 2px;
  background: var(--tint);
}
.ix-sep {
  height: 20px;
  background: #ececec;
}
.ix-entry {
  height: 32px;
}
.ix-entry small {
  font-size: 9px;
  color: var(--db-text);
}
.ix-empty {
  border: 1px dashed var(--db-table-rule);
  background: none;
}
/* root → leaves: a stub down from the root, a bar, and a stub into each of
   the first and last leaf (equal grid cells, so their centres sit at
   50%/n from either side) */
.ix-edges {
  position: relative;
  align-self: stretch;
  height: 10px;
  border: 1.5px solid var(--db-table-rule);
  border-bottom: 0;
}
.ix-edges::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: calc(50% - 0.75px);
  height: 8px;
  border-left: 1.5px solid var(--db-table-rule);
}
.ix-leaves {
  display: grid;
}
.ix-cell {
  display: flex;
  justify-content: center;
  padding: 0 10px;
}
</style>
