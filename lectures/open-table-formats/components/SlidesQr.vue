<script setup lang="ts">
// QR code of this lecture's slides on GitHub Pages, for the cover. The path is
// the code for URL, generated once (error correction Q, so it survives a
// projector), drawn as one stroke per run of dark modules. If the URL changes,
// regenerate it with segno (pip install segno):
//   segno.make(URL, error='q').save(f, kind='svg', border=0)  -> the path's d
const URL = 'https://vmelisch.github.io/sde_wise26_27/open-table-formats/'
const SIZE = 37
const D = 'M0 0.5h7m1 0h1m1 0h2m2 0h1m1 0h4m1 0h1m1 0h1m2 0h2m2 0h7m-37 1h1m5 0h1m2 0h2m2 0h2m1 0h1m2 0h3m1 0h5m2 0h1m5 0h1m-37 1h1m1 0h3m1 0h1m1 0h1m1 0h1m2 0h6m3 0h3m5 0h1m1 0h3m1 0h1m-37 1h1m1 0h3m1 0h1m1 0h2m2 0h1m1 0h2m4 0h1m1 0h2m1 0h3m2 0h1m1 0h3m1 0h1m-37 1h1m1 0h3m1 0h1m5 0h2m1 0h2m2 0h1m1 0h1m1 0h1m1 0h1m1 0h1m2 0h1m1 0h3m1 0h1m-37 1h1m5 0h1m1 0h2m1 0h3m1 0h1m1 0h2m3 0h1m1 0h1m2 0h2m1 0h1m5 0h1m-37 1h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7m-29 1h1m1 0h1m1 0h1m2 0h1m1 0h3m1 0h1m2 0h1m-24 1h1m1 0h1m1 0h7m2 0h1m1 0h1m4 0h1m2 0h8m1 0h2m1 0h1m-37 1h1m1 0h3m2 0h2m1 0h4m1 0h1m1 0h1m2 0h1m1 0h1m5 0h3m3 0h1m-35 1h1m3 0h1m1 0h3m2 0h2m3 0h2m1 0h1m1 0h2m5 0h1m1 0h2m1 0h1m1 0h2m-34 1h2m5 0h3m1 0h1m2 0h2m2 0h5m1 0h2m2 0h2m2 0h1m-35 1h1m3 0h9m5 0h1m1 0h1m1 0h3m1 0h1m1 0h3m1 0h1m1 0h2m-35 1h1m2 0h1m2 0h1m1 0h2m1 0h2m1 0h2m3 0h1m2 0h1m1 0h1m1 0h1m1 0h2m1 0h1m1 0h2m-37 1h2m1 0h1m1 0h7m1 0h1m3 0h1m1 0h2m2 0h1m1 0h1m2 0h2m1 0h1m2 0h1m1 0h1m-37 1h2m1 0h2m2 0h3m2 0h2m3 0h1m2 0h2m1 0h3m5 0h2m3 0h1m-35 1h2m1 0h2m4 0h3m2 0h1m1 0h5m1 0h1m1 0h1m1 0h4m1 0h2m1 0h1m-36 1h1m1 0h1m4 0h2m2 0h1m1 0h1m2 0h3m2 0h3m1 0h1m1 0h3m1 0h3m1 0h1m-37 1h1m1 0h2m1 0h4m1 0h2m1 0h1m2 0h1m2 0h2m1 0h1m2 0h1m2 0h1m1 0h2m2 0h3m-37 1h1m1 0h2m1 0h1m1 0h1m1 0h2m2 0h3m5 0h1m1 0h2m1 0h3m1 0h2m1 0h3m-34 1h3m1 0h2m2 0h3m4 0h1m3 0h1m2 0h2m1 0h2m1 0h3m-33 1h2m1 0h2m2 0h1m2 0h1m1 0h1m2 0h1m2 0h1m2 0h2m3 0h1m2 0h2m3 0h3m-37 1h1m1 0h1m2 0h3m1 0h2m1 0h2m3 0h1m1 0h3m7 0h1m1 0h4m1 0h1m-32 1h1m1 0h2m3 0h1m2 0h1m1 0h1m1 0h1m1 0h5m6 0h1m3 0h1m-37 1h2m1 0h2m1 0h3m1 0h1m1 0h4m1 0h2m2 0h1m2 0h2m1 0h4m2 0h1m1 0h1m-35 1h1m3 0h1m2 0h1m3 0h1m1 0h9m1 0h1m1 0h1m1 0h4m2 0h3m-37 1h1m1 0h1m2 0h2m1 0h1m4 0h4m1 0h1m3 0h2m1 0h2m2 0h3m2 0h1m1 0h1m-36 1h1m1 0h3m1 0h2m1 0h1m3 0h5m1 0h2m1 0h1m1 0h1m1 0h2m1 0h2m3 0h1m-36 1h3m1 0h1m1 0h1m2 0h4m2 0h2m1 0h1m1 0h5m3 0h5m1 0h3m-29 1h3m1 0h2m1 0h1m2 0h1m2 0h1m1 0h2m1 0h1m1 0h1m3 0h1m3 0h1m-37 1h7m1 0h1m2 0h7m1 0h1m1 0h2m2 0h1m1 0h2m1 0h1m1 0h1m1 0h3m-37 1h1m5 0h1m1 0h4m4 0h1m1 0h1m1 0h2m1 0h2m2 0h2m3 0h1m1 0h1m1 0h1m-37 1h1m1 0h3m1 0h1m3 0h2m1 0h1m1 0h1m1 0h1m3 0h2m1 0h3m1 0h6m1 0h2m-37 1h1m1 0h3m1 0h1m1 0h2m1 0h3m2 0h1m2 0h1m1 0h1m2 0h2m3 0h1m1 0h2m1 0h1m1 0h1m-37 1h1m1 0h3m1 0h1m2 0h1m1 0h7m1 0h1m2 0h1m1 0h1m1 0h2m1 0h1m2 0h1m1 0h1m1 0h1m-37 1h1m5 0h1m1 0h1m2 0h2m1 0h1m2 0h1m3 0h3m1 0h5m-30 1h7m2 0h2m1 0h1m1 0h3m1 0h4m3 0h4m1 0h3m2 0h2'
</script>

<template>
  <a class="qr" :href="URL">
    <svg class="qr-code" :viewBox="`-2 -2 ${SIZE + 4} ${SIZE + 4}`" shape-rendering="crispEdges" aria-label="QR code of the slides">
      <path :d="D" stroke="currentColor" />
    </svg>
    <b class="qr-text">Follow the slides</b>
  </a>
</template>

<style scoped>
/* the label as a caption under the code */
.qr {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  color: var(--db-text-soft);
  text-decoration: none;
  border: none;
}
.qr-text {
  font-size: var(--db-fs-small);
}
/* 2 modules of white around the code (its quiet zone, on top of the slide's white) */
.qr-code {
  width: 140px;
  height: 140px;
  color: var(--db-navy);
  background: #fff;
}
</style>
