<template>
  <!-- "flows into": a short grey arrow between the steps of a pipeline row -->
  <svg class="flow-arrow" viewBox="0 0 36 12" width="36" height="12">
    <path d="M1 6h32M28 1.5l5 4.5-5 4.5" />
  </svg>
</template>

<style scoped>
.flow-arrow {
  flex: none;
  fill: none;
  stroke: var(--db-table-rule);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
