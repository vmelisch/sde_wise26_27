<script setup lang="ts">
// Where an architecture joins transactions and analytics, as a badge after a
// slide title: the x-axis of the closing SystemMap, in its chip colours.
const FAMILIES = {
  engine: ['one engine', 'blue'],
  system: ['n engines, one system', 'blue'],
  systems: ['n systems', 'red'],
  lake: ['open lake', 'purple'],
} as const

const props = defineProps<{ k: keyof typeof FAMILIES }>()
const [label, tint] = FAMILIES[props.k]
</script>

<template>
  <span class="family" :style="{ background: `var(--tint-${tint})` }">{{ label }}</span>
</template>

<style scoped>
/* sized like the .issue badges, but tinted: a category, not a problem */
.family {
  display: inline-block;
  padding: 0.3em 6px;
  border-radius: 3px;
  color: var(--db-text-soft);
  font-size: var(--db-fs-table);
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
  text-box: trim-both cap alphabetic;
  vertical-align: middle;
}
</style>
