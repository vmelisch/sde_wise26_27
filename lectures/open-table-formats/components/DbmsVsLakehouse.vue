<script setup lang="ts">
// Traditional DBMS vs. lakehouse, after slide 54 of the SDE Data Lakes deck:
// both have clients on the left, a component in the middle that coordinates
// them, and the files on the right. Colours as in the intro's stacks: blue
// does the query processing (the DBMS server; in a lakehouse the engines
// themselves), purple is table-format metadata, yellow is storage. The
// differences are blue labels. Hooks for the slide timeline: dvl-d1 clients,
// dvl-d2 data path, dvl-d3 latency, dvl-d4 scalability.
const SQL_CLIENTS = ['SQL client 1', 'SQL client 2', 'SQL client 3']
const ENGINES = ['DuckDB', 'Spark', 'Python', 'BI tool']
</script>

<template>
  <div class="dvl">
    <div class="dvl-title">Traditional DBMS</div>
    <div class="dvl-grid" style="grid-template-rows: repeat(3, 28px) auto">
      <div v-for="(c, i) in SQL_CLIENTS" :key="c" class="dvl-chip dvl-sql" :style="{ gridArea: `${i + 1} / 1` }">
        {{ c }}
      </div>
      <div class="dvl-arrow dvl-both" style="grid-area: 1 / 2 / 4 / 3">
        <span class="dvl-note">SQL</span>
      </div>
      <div class="dvl-box" style="grid-area: 1 / 3 / 4 / 4; background: var(--tint-blue)">
        DBMS server<small>parse, optimize, execute</small><small>locks / MVCC, buffer pool</small>
      </div>
      <div class="dvl-arrow dvl-both" style="grid-area: 1 / 4 / 4 / 5">
        <span class="dvl-diff dvl-d3">µs – ms per access</span>
      </div>
      <div class="dvl-box" style="grid-area: 1 / 5 / 4 / 6; background: var(--tint-yellow)">
        local disks<small>proprietary pages</small>
      </div>
      <div class="dvl-diff dvl-d1" style="grid-area: 4 / 1">same kind of client</div>
      <div class="dvl-diff dvl-d4 dvl-end" style="grid-area: 4 / 5">TBs, throughput bounded by one server</div>
    </div>

    <div class="dvl-title dvl-sep">Lakehouse</div>
    <div class="dvl-grid" style="grid-template-rows: repeat(4, 28px) auto">
      <div v-for="(e, i) in ENGINES" :key="e" class="dvl-chip" :style="{ gridArea: `${i + 1} / 1` }">
        {{ e }}
      </div>
      <div class="dvl-arrow dvl-both" style="grid-area: 1 / 2 / 3 / 3">
        <span class="dvl-note">metadata</span>
      </div>
      <div class="dvl-box" style="grid-area: 1 / 3 / 3 / 4; background: var(--tint-purple)">
        catalog / metadata<small>snapshots, commits, zone maps</small>
      </div>
      <div class="dvl-diff dvl-d3 dvl-latency" style="grid-area: 1 / 4 / 3 / 5">
        10 – 100 ms<br>per request
      </div>
      <!-- the data path: past the catalog, straight to the object store -->
      <div class="dvl-data dvl-d2" style="grid-area: 3 / 2 / 5 / 5">
        <span class="dvl-note">data: read directly, in parallel</span>
        <div v-for="k in 3" :key="k" class="dvl-arrow" />
      </div>
      <div class="dvl-box" style="grid-area: 1 / 5 / 5 / 6; background: var(--tint-yellow)">
        object store<small>Parquet files</small>
      </div>
      <div class="dvl-diff dvl-d1" style="grid-area: 5 / 1">any engine: S3 + Parquet</div>
      <div class="dvl-diff dvl-d4 dvl-end" style="grid-area: 5 / 5">PBs, throughput scales with readers</div>
    </div>
  </div>
</template>

<style scoped>
.dvl {
  font-size: var(--db-fs-small);
  line-height: 1.3;
}
.dvl-title {
  margin-bottom: 8px;
  font-weight: 700;
}
.dvl-sep {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1.5px solid var(--db-table-rule);
}
.dvl-grid {
  display: grid;
  grid-template-columns: 130px 1fr 240px 1fr 250px;
  row-gap: 6px;
  align-items: center;
}

.dvl-chip {
  display: grid;
  place-items: center;
  height: 100%;
  border-radius: 4px;
  background: var(--tint-blue);
}
.dvl-chip.dvl-sql {
  background: #ececec;
}
.dvl-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 4px 10px;
  border-radius: 4px;
  text-align: center;
}
.dvl-box small {
  display: block;
  color: var(--db-text);
  font-size: var(--db-fs-table);
  white-space: nowrap;
}

/* A horizontal arrow filling its grid cell, with an optional label on top. */
.dvl-arrow {
  position: relative;
  margin: 0 8px;
  border-top: 1.5px solid;
  color: var(--db-table-rule);
}
.dvl-arrow::after,
.dvl-both::before {
  content: '';
  position: absolute;
  top: -4.75px;
  border: 4px solid transparent;
}
.dvl-arrow::after {
  right: -1px;
  border-right: 0;
  border-left: 7px solid;
}
.dvl-both::before {
  left: -1px;
  border-left: 0;
  border-right: 7px solid;
}
.dvl-arrow > span {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

/* Data arrows: three in parallel, the label above them, centred under the
   catalog (the middle column of the three they span). */
.dvl-data {
  display: grid;
  grid-template-columns: subgrid;
  row-gap: 7px;
  align-self: center;
}
.dvl-data > .dvl-note {
  grid-column: 2;
  text-align: center;
}
.dvl-data > .dvl-arrow {
  grid-column: 1 / -1;
  color: var(--db-accent1);
}

.dvl-note {
  font-size: var(--db-fs-caption);
  font-style: italic;
  color: var(--db-text);
}
/* What differs between the two */
.dvl-diff {
  font-size: var(--db-fs-caption);
  font-weight: 600;
  color: var(--db-heading-blue);
  white-space: nowrap;
}
.dvl-end {
  justify-self: end;
}
.dvl-latency {
  align-self: end;
  padding-bottom: 4px;
  text-align: center;
  white-space: normal;
}
</style>
