<script setup lang="ts">
// An LTAP read along the WAL, after the HTAP deck (06-LTAP, slide 36): up to
// LSN(mat) the changes are in the lake as Parquet, the tail up to LSN(query)
// is still in the pageserver, later commits are not seen. Not to scale.
const SEGS = [
  { cls: 'lb-lake', flex: 5, label: 'in the lake', sub: 'Parquet', mark: 'LSN(mat)' },
  { cls: 'lb-tail', flex: 2.4, label: 'tail', sub: 'pageserver', mark: 'LSN(query)' },
  { cls: 'lb-future', flex: 1.6, label: 'later', sub: 'not seen' },
]
</script>

<template>
  <div class="lb">
    <div class="lb-axis">WAL position (LSN) →</div>
    <div class="lb-row">
      <div v-for="s in SEGS" :key="s.cls" class="lb-seg" :class="s.cls" :style="{ flex: s.flex }">
        {{ s.label }}<small>{{ s.sub }}</small>
      </div>
    </div>
    <div class="lb-row">
      <div v-for="s in SEGS" :key="s.cls" class="lb-mark" :style="{ flex: s.flex }">
        <span v-if="s.mark">{{ s.mark }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lb {
  font-size: var(--db-fs-small);
  line-height: 1.25;
}
.lb-axis {
  margin-bottom: 4px;
  font-size: var(--db-fs-caption);
  color: var(--db-text);
}
.lb-row {
  display: flex;
}
.lb-seg {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 48px;
  text-align: center;
  box-shadow: inset -2px 0 #fff;
}
.lb-seg small {
  color: var(--db-text);
  font-size: var(--db-fs-table);
}
.lb-lake {
  border-radius: 4px 0 0 4px;
  background: var(--tint-teal);
}
.lb-tail {
  background: #ececec;
}
.lb-future {
  border: 1.5px dashed var(--db-table-rule);
  border-left: none;
  border-radius: 0 4px 4px 0;
  box-shadow: none;
  color: var(--db-text);
}

/* a tick at the end of a segment, its LSN below */
.lb-mark {
  position: relative;
  height: 24px;
}
.lb-mark > span {
  position: absolute;
  top: 10px;
  right: 0;
  transform: translateX(50%);
  font-family: var(--slidev-code-font-family);
  font-size: var(--db-fs-table);
  line-height: 1;
  white-space: nowrap;
}
.lb-mark > span::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  height: 8px;
  border-left: 1.5px solid var(--db-text-soft);
}
</style>
