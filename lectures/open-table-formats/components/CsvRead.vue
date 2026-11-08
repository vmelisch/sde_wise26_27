<script setup lang="ts">
import { computed } from 'vue'
import { TINT } from '../palette'
import { COLS } from '../orders'

// One line of orders.csv and the fields a reader cuts it into, for the
// "CSV Limits" examples. Field i lands in column i and gets its tint (as in
// FileView); fields listed in `bad`, fields past the last column and empty
// fields (NULL or ''?) are red. By default the reader follows RFC 4180
// (quotes protect separators, "" is a quote); `split` cuts at every separator.
const props = withDefaults(defineProps<{
  line: string
  sep?: string
  split?: boolean
  bad?: number[]
  caption?: string
  note?: string
}>(), { sep: ',', split: false, bad: () => [] })

function parse(line: string): string[] {
  if (props.split) return line.split(props.sep)
  const out = ['']
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quoted && ch === '"' && line[i + 1] === '"') { out[out.length - 1] += '"'; i++ }
    else if (ch === '"') quoted = !quoted
    else if (!quoted && ch === props.sep) out.push('')
    else out[out.length - 1] += ch
  }
  return out
}

const fields = computed(() => parse(props.line).map((v, i) => {
  const bad = props.bad.includes(i) || i >= COLS.length || v === ''
  return { v: v === '' ? '?' : v, col: COLS[i]?.name ?? '?', bad, tint: bad ? TINT.red : COLS[i].tint }
}))
</script>

<template>
  <div class="cr">
    <div v-if="props.caption" class="cr-caption">{{ props.caption }}</div>
    <div class="cr-line">{{ props.line }}</div>
    <div class="cr-row">
      <span v-for="(f, i) in fields" :key="i" class="cr-field" :class="[`cr-f${i}`, { 'cr-bad': f.bad }]">
        <span class="cr-col">{{ f.col }}</span>
        <span class="cr-cell" :style="{ '--tint': f.tint }">{{ f.v }}</span>
      </span>
      <span v-if="props.note" class="cr-note">{{ props.note }}</span>
    </div>
  </div>
</template>

<style scoped>
.cr {
  font-family: var(--slidev-code-font-family);
  font-size: 10px;
  line-height: 1.2;
  color: var(--db-text-soft);
}
.cr-caption {
  margin-bottom: 3px;
  color: var(--db-text);
}
.cr-line {
  margin-bottom: 5px;
  white-space: pre;
}
.cr-row {
  display: flex;
  align-items: flex-end;
  gap: 4px;
}
.cr-field {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: 1px;
}
.cr-col {
  font-size: 8px;
  color: var(--db-text);
}
.cr-bad .cr-col {
  color: var(--db-accent5);
}
.cr-cell {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 4px;
  border-radius: 2px;
  /* keep the blank that a naive split leaves at the start of a field */
  white-space: pre;
  background: var(--tint);
}
/* on the cells' line, not the labels' */
.cr-note {
  margin-left: 8px;
  line-height: 20px;
  color: var(--db-text);
  white-space: nowrap;
}
</style>
