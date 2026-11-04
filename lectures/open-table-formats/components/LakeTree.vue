<script setup lang="ts">
import { computed } from 'vue'

// The lake's object listing at one stage of the "data lake → lakehouse" story:
//   single     one big Parquet file
//   flat       every change adds or rewrites a file (issues i1–i4)
//   hive       files grouped into year=/month= prefixes
//   compact    the small October files merged into one
//   snapshots  + metadata/ listing which files make up each snapshot
// Lines keep their data-morph key (lt-<key>) across stages, so each file moves
// to its new place between slides. Hooks for timelines: every line has class
// lt-k-<key>.
type Line = { key: string, prefix: string, name: string, size?: string, tags?: string[], note?: string, state?: 'gone' | 'new' | 'current' }

const STAGES: Record<string, Line[]> = {
  single: [
    { key: 'root', prefix: '', name: 's3://lake/orders/' },
    { key: '000', prefix: '└─ ', name: 'orders.parquet', size: '10 GB' },
  ],
  flat: [
    { key: 'root', prefix: '', name: 's3://lake/orders/' },
    { key: '000', prefix: '├─ ', name: 'part-000.parquet', size: '512 MB' },
    { key: '001', prefix: '├─ ', name: 'part-001.parquet', size: '498 MB', state: 'gone', note: 'contains 1 deleted row' },
    { key: '001r', prefix: '├─ ', name: 'part-001-r1.parquet', size: '498 MB', tags: ['i2', 'i3'], note: 'rewritten' },
    { key: '002', prefix: '├─ ', name: 'part-002.parquet', size: '3 KB', tags: ['i1'] },
    { key: '003', prefix: '├─ ', name: 'part-003.parquet', size: '1 KB', tags: ['i1'] },
    { key: '004', prefix: '├─ ', name: 'part-004.parquet', size: '2 KB', tags: ['i1'] },
    { key: 'more', prefix: '└─ ', name: '… 900 more files', tags: ['i4'] },
  ],
  hive: [
    { key: 'root', prefix: '', name: 's3://lake/orders/' },
    { key: 'd09', prefix: '├─ ', name: 'year=2026/month=09/' },
    { key: '000', prefix: '│  ├─ ', name: 'part-000.parquet', size: '512 MB' },
    { key: '001r', prefix: '│  └─ ', name: 'part-001-r1.parquet', size: '498 MB' },
    { key: 'd10', prefix: '└─ ', name: 'year=2026/month=10/' },
    { key: '002', prefix: '   ├─ ', name: 'part-002.parquet', size: '3 KB' },
    { key: '003', prefix: '   ├─ ', name: 'part-003.parquet', size: '1 KB' },
    { key: '004', prefix: '   └─ ', name: 'part-004.parquet', size: '2 KB' },
  ],
}
STAGES.compact = [
  ...STAGES.hive.slice(0, 5),
  ...STAGES.hive.slice(5).map(l => ({ ...l, prefix: '   ├─ ', state: 'gone' as const })),
  { key: 'c', prefix: '   └─ ', name: 'compact.parquet', size: '6 KB', state: 'new' },
]
STAGES.snapshots = [
  STAGES.hive[0],
  { key: 'meta', prefix: '├─ ', name: 'metadata/' },
  { key: 's1', prefix: '│  ├─ ', name: 'snap-1.json', note: 'files 000, 001-r1' },
  { key: 's2', prefix: '│  ├─ ', name: 'snap-2.json', note: 'adds 002, 003, 004' },
  { key: 's3', prefix: '│  └─ ', name: 'snap-3.json', note: 'replaces 002 to 004 by compact', state: 'current' },
  ...STAGES.compact.slice(1),
]

const props = defineProps<{ stage: 'single' | 'flat' | 'hive' | 'compact' | 'snapshots' }>()
const lines = computed(() => STAGES[props.stage])
</script>

<template>
  <div class="lt">
    <div
      v-for="line in lines"
      :key="line.key"
      class="lt-line"
      :class="[`lt-k-${line.key}`, line.state && `lt--${line.state}`]"
      :data-morph="`lt-${line.key}`"
    >
      <span class="lt-path">{{ line.prefix }}<b v-if="line.name.endsWith('/')">{{ line.name }}</b><template v-else>{{ line.name }}</template></span>
      <span class="lt-size">{{ line.size }}</span>
      <span v-for="t in line.tags" :key="t" class="issue">{{ t }}</span>
      <span v-if="line.note" class="lt-note">{{ line.note }}</span>
    </div>
  </div>
</template>

<style scoped>
.lt {
  font-family: var(--slidev-code-font-family);
  font-size: 11px;
  line-height: 1.6;
  color: var(--db-text-soft);
}
.lt-line {
  display: flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  padding: 0 4px;
  border-radius: 3px;
}
.lt-path {
  width: 30ch;
  white-space: pre;
}
.lt-size {
  width: 7ch;
  text-align: right;
  color: var(--db-text);
}
.lt-note {
  color: var(--db-text);
  font-style: italic;
}
.lt--gone .lt-path,
.lt--gone .lt-size {
  color: var(--db-table-rule);
  text-decoration: line-through;
}
.lt--new {
  background: var(--tint-teal);
}
.lt--current {
  background: var(--tint-blue);
}
</style>
