<script setup lang="ts">
// One architecture that joins transactions and analytics (shared storage,
// replicated storage, DWH + ETL, CDC, federation), drawn from its geometry in
// systems.ts: areas behind, then the arrows in one SVG on the same
// coordinates, then the boxes, badges and labels. Hook for the slide timeline:
// sd-s1, the analytical side of the diagram.
import { useId } from 'vue'
import { TINT } from '../palette'
import { DIAGRAMS, type DiagramKey, type Node } from '../systems'

const props = defineProps<{ of: DiagramKey }>()
const d = DIAGRAMS[props.of]

// markers need ids that are unique on the page: Slidev mounts several slides
const uid = useId()
const KINDS = ['w', 'p', 'r'] as const

const BADGE = 20
const bg = (t: Node['tint']) => (t === 'white' ? '#fff' : t ? TINT[t] : '#ececec')
function nodeStyle(n: Node) {
  if (n.shape === 'w' || n.shape === 'r')
    return { left: `${n.x - BADGE / 2}px`, top: `${n.y - BADGE / 2}px` }
  return { left: `${n.x}px`, top: `${n.y}px`, width: `${n.w}px`, height: `${n.h}px`, background: bg(n.tint) }
}
const step = (s?: number) => s && `sd-s${s}`
</script>

<template>
  <div class="sd" :style="{ width: `${d.w}px`, height: `${d.h}px` }">
    <div
      v-for="(a, i) in d.areas" :key="`a${i}`" class="sd-area" :class="[`sd-${a.shape}`, `sd-at-${a.at ?? 'tl'}`, step(a.step)]"
      :style="{ left: `${a.x}px`, top: `${a.y}px`, width: `${a.w}px`, height: `${a.h}px`, background: a.tint && TINT[a.tint] }"
    >
      <span>{{ a.label }}</span>
    </div>

    <svg class="sd-lines" :viewBox="`0 0 ${d.w} ${d.h}`" :width="d.w" :height="d.h">
      <defs>
        <marker v-for="k in KINDS" :id="`${uid}-${k}`" :key="k" viewBox="0 0 8 8" refX="7.5" refY="4" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto">
          <path :class="`sd-k-${k}`" d="M0 0.5L7.5 4L0 7.5z" />
        </marker>
      </defs>
      <path
        v-for="(a, i) in d.arrows" :key="`p${i}`" :d="a.d" class="sd-arrow"
        :class="[`sd-k-${a.k}`, a.dash && 'sd-dash', step(a.step)]" :marker-end="`url(#${uid}-${a.k})`"
      />
    </svg>

    <div v-for="(n, i) in d.nodes" :key="`n${i}`" class="sd-node" :class="[`sd-${n.shape ?? 'box'}`, step(n.step)]" :style="nodeStyle(n)">
      <template v-if="n.shape === 'w' || n.shape === 'r'">
        {{ n.shape.toUpperCase() }}
      </template>
      <template v-else>
        {{ n.label }}<small v-if="n.sub">{{ n.sub }}</small>
      </template>
    </div>

    <span
      v-for="(l, i) in d.labels" :key="`l${i}`" class="sd-lbl" :class="[`sd-k-${l.k}`, l.align && `sd-${l.align}`, step(l.step)]"
      :style="{ left: `${l.x}px`, top: `${l.y}px` }"
    >{{ l.text }}</span>
  </div>
</template>

<style scoped>
.sd {
  position: relative;
  font-size: var(--db-fs-small);
  line-height: 1.2;
}
.sd > * {
  position: absolute;
}

/* areas: a dashed outline or a tinted band, the label in one corner */
.sd-area {
  border-radius: 6px;
}
.sd-group {
  border: 1.5px dashed var(--db-table-rule);
}
.sd-area span {
  position: absolute;
  font-size: var(--db-fs-caption);
  font-weight: 700;
  color: var(--db-text);
  white-space: nowrap;
}
.sd-at-tl span { top: 4px; left: 8px; }
.sd-at-tr span { top: 4px; right: 8px; }
.sd-at-bl span { bottom: 4px; left: 8px; }

.sd-lines {
  top: 0;
  left: 0;
  overflow: visible;
  fill: none;
}
.sd-arrow {
  stroke-width: 1.5;
  stroke-linejoin: round;
}
.sd-dash {
  stroke-dasharray: 5 4;
}
path.sd-k-w { stroke: var(--db-text); }
path.sd-k-p { stroke: var(--db-accent1); }
path.sd-k-r { stroke: var(--db-heading-blue); }
marker path.sd-k-w { fill: var(--db-text); stroke: none; }
marker path.sd-k-p { fill: var(--db-accent1); stroke: none; }
marker path.sd-k-r { fill: var(--db-heading-blue); stroke: none; }

.sd-node {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 6px;
  border-radius: 4px;
  text-align: center;
}
.sd-node small {
  display: block;
  color: var(--db-text);
  font-size: var(--db-fs-table);
  line-height: 1.15;
}
/* a cylinder: elliptic top and bottom, the lip of the top drawn as a line */
.sd-db {
  padding-top: 10px;
  border-radius: 50% / 8px;
}
.sd-db::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 16px;
  border-bottom: 1.5px solid rgba(0, 0, 0, 0.16);
  border-radius: 50%;
}
/* W: a transaction writing, R: an analytical query reading (arrow colours) */
.sd-w,
.sd-r {
  width: 20px;
  height: 20px;
  padding: 0;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
}
.sd-w { background: var(--db-text); }
.sd-r { background: var(--db-heading-blue); }

.sd-lbl {
  transform: translateY(-50%);
  font-size: var(--db-fs-caption);
  white-space: nowrap;
}
.sd-lbl.sd-c { transform: translate(-50%, -50%); }
.sd-lbl.sd-e { transform: translate(-100%, -50%); }
.sd-lbl.sd-k-w { color: var(--db-text); }
.sd-lbl.sd-k-p { color: var(--db-accent1); font-weight: 600; }
.sd-lbl.sd-k-r { color: var(--db-heading-blue); }
</style>
