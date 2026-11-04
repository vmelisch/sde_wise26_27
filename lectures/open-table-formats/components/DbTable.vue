<script setup lang="ts">
import type { Tint } from '../palette'
import { TINT } from '../palette'

// A table from data, styled by the theme like a Markdown table, with hooks for
// the slide timelines: row i (1-based) has class r<i>, column j class c<j>.
// `tints` colours whole rows (for result tables), `code` sets the caption in
// mono (for an operator such as UNION ALL). The table is at least as wide as
// its caption.
const props = withDefaults(defineProps<{
  caption?: string
  head: string[]
  rows: (string | number)[][]
  tints?: (Tint | null)[]
  code?: boolean
}>(), { caption: '', tints: () => [], code: false })

const tintOf = (i: number) => {
  const t = props.tints[i]
  return t ? { backgroundColor: TINT[t] } : undefined
}
</script>

<template>
  <div class="dbt">
    <p v-if="props.caption">
      <span class="table-caption" :class="{ 'dbt__code': props.code }">{{ props.caption }}</span>
    </p>
    <table>
      <thead>
        <tr>
          <th v-for="(h, j) in props.head" :key="j" :class="`c${j + 1}`">{{ h }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in props.rows" :key="i" :class="`r${i + 1}`" :style="tintOf(i)">
          <td v-for="(cell, j) in row" :key="j" :class="`c${j + 1}`">{{ cell }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.dbt {
  display: grid;
  grid-template-columns: max-content;
}
.dbt table {
  width: 100%;
}
/* Even rows get an explicit white, so a colour tween starts from white rather
   than from transparent black. */
.dbt tbody tr:nth-child(even) {
  background-color: #fff;
}
/* The bottom rule belongs to the table, not to its last row, so it stays at the
   bottom when a timeline moves rows around. */
.slidev-layout .dbt table {
  border-bottom: 1px solid var(--db-table-rule);
}
.slidev-layout .dbt tbody tr:last-child td {
  border-bottom: none;
}
.dbt__code {
  font-family: var(--slidev-code-font-family);
}
</style>
