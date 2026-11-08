<script setup lang="ts">
import { computed } from 'vue'
import { COLS, csvText, ROWS, SCRAMBLED } from '../orders'

// orders.csv as what it is on disk: one string, lines only marked by \n
// (FileView's csv stage, same row order). To find row `row`, a reader scans
// every byte before it and counts newlines; those bytes are greyed, the \n it
// counts are red. Shows the file up to row `row`.
const props = defineProps<{ row: number }>()

const lines = [COLS.map(c => c.name).join(','), ...SCRAMBLED.map(r => ROWS[r].map((v, c) => csvText(c, v)).join(','))]
const before = computed(() => lines.slice(0, props.row + 1)) // header + rows 0 … row-1
const start = computed(() => before.value.reduce((n, l) => n + l.length + 1, 0))
</script>

<template>
  <div class="ls">
    <div class="ls-caption">orders.csv on disk: one string</div>
    <div class="ls-text">
      <template v-for="(l, i) in before" :key="i">
        <span class="ls-scan">{{ l }}</span><span class="ls-nl">\n</span>
      </template>
      <span class="ls-row">{{ lines[props.row + 1] }}</span><span class="ls-scan">…</span>
    </div>
    <div class="ls-note">
      row {{ props.row }} starts at byte {{ start }}, after {{ before.length }} × \n: found only by reading bytes 0–{{ start - 1 }}
    </div>
  </div>
</template>

<style scoped>
.ls {
  font-family: var(--slidev-code-font-family);
  font-size: 10px;
  line-height: 1.35;
  color: var(--db-text-soft);
}
.ls-caption,
.ls-note {
  color: var(--db-text);
}
.ls-caption {
  margin-bottom: 3px;
}
.ls-note {
  margin-top: 5px;
}
/* wrap anywhere: there are no lines, only bytes */
.ls-text {
  word-break: break-all;
}
.ls-scan {
  color: #9a9a9a;
}
.ls-nl {
  color: var(--db-accent5);
  font-weight: 700;
}
.ls-row {
  font-weight: 700;
}
</style>
