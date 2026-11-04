<script setup lang="ts">
// One of the open issues of a plain data lake (slide "Mutability on Immutable
// Storage"): its number and a short name, so that a slide fixing it says which
// one without the audience having to remember the number. `solved` marks a
// slide that fixes it. Styled as .issue in style.css.
const NAMES: Record<number, string> = {
  1: 'many small files',
  2: 'full file rewrites',
  3: 'concurrent writers',
  4: 'every file opened',
}

defineProps<{ n: number | string, solved?: boolean }>()
</script>

<template>
  <span class="issue" :class="{ solved }"><b>i{{ n }}</b>{{ NAMES[Number(n)] }}</span>
</template>
