<script setup lang="ts">
import { COLS, csvText, ROWS, SCRAMBLED } from '../orders'

// orders.csv (the file of CSV Limits) through LZ77, in two versions stacked in
// one spot, one line per line of the file, ⏎ = the newline byte:
//   .lz-in   the text; every byte that repeats earlier bytes is in a .lz-m
//            span, tinted by the root's --hl (0…1)
//   .lz-out  the same lines with each repeat replaced by its back-reference
//            (distance, length), .lz-ref; the first one, .lz-ex, has its
//            source marked .lz-src
// Greedy LZ77 in the LZSS form of LZ4 and Snappy: at each byte take the
// longest earlier match of at least MIN bytes (the closest on ties), else
// emit the byte as a literal. A reference sits where its first visible byte
// was; newlines inside it vanish with it.
const MIN = 4

const lines = [COLS.map(c => c.name).join(','), ...SCRAMBLED.map(r => ROWS[r].map((v, c) => csvText(c, v)).join(','))]
const text = lines.map(l => `${l}\n`).join('')
const lineStart = lines.map((_, i) => lines.slice(0, i).reduce((n, l) => n + l.length + 1, 0))
const lineOf = lines.flatMap((l, i) => Array.from({ length: l.length + 1 }, () => i))

interface Ref { at: number, len: number, dist: number }
const refs: Ref[] = []
for (let i = 0; i < text.length;) {
  let best = { len: 0, dist: 0 }
  for (let j = 0; j < i; j++) {
    let l = 0
    while (i + l < text.length && text[j + l] === text[i + l]) l++
    if (l > 0 && l >= best.len) best = { len: l, dist: i - j }
  }
  if (best.len >= MIN) {
    refs.push({ at: i, ...best })
    i += best.len
  }
  else {
    i++
  }
}
const refOf = Array.from({ length: text.length }, () => -1)
refs.forEach((r, k) => { for (let p = r.at; p < r.at + r.len; p++) refOf[p] = k })
const covered = refs.reduce((n, r) => n + r.len, 0)
const ex = refs[0]
const isSrc = (p: number) => p >= ex.at - ex.dist && p < ex.at - ex.dist + ex.len

// .lz-in: runs of bytes in the same reference (or none, -1)
interface SegIn { s: string, nl: boolean, ref: number }
const linesIn: SegIn[][] = lines.map((l, i) => {
  const segs: SegIn[] = []
  for (let p = lineStart[i]; p <= lineStart[i] + l.length; p++) {
    const nl = text[p] === '\n'
    const last = segs.at(-1)
    if (last && last.ref === refOf[p]) {
      if (nl) last.nl = true
      else last.s += text[p]
    }
    else {
      segs.push({ s: nl ? '' : text[p], nl, ref: refOf[p] })
    }
  }
  return segs
})

// .lz-out: literal runs (split where the example's source starts and ends) and references
type SegOut = { s: string, nl: boolean, src: boolean } | { ref: number }
const linesOut: SegOut[][] = lines.map(() => [])
for (let p = 0, k = 0; p < text.length;) {
  if (k < refs.length && refs[k].at === p) {
    let q = p
    while (text[q] === '\n') q++
    linesOut[lineOf[q]].push({ ref: k })
    p += refs[k++].len
    continue
  }
  const line = linesOut[lineOf[p]]
  const last = line.at(-1)
  const nl = text[p] === '\n'
  if (last && 'src' in last && last.src === isSrc(p) && !last.nl) {
    if (nl) last.nl = true
    else last.s += text[p]
  }
  else {
    line.push({ s: nl ? '' : text[p], nl, src: isSrc(p) })
  }
  p++
}
const literals = text.length - covered
const label = (k: number) => `(${refs[k].dist},${refs[k].len})`
</script>

<template>
  <div class="lz">
    <div class="lz-stack">
      <div class="lz-in">
        <div class="lz-caption">orders.csv: {{ text.length }} B</div>
        <div v-for="(segs, i) in linesIn" :key="i" class="lz-line">
          <span v-for="(g, j) in segs" :key="j" :class="{ 'lz-m': g.ref >= 0 }">{{ g.s }}<span v-if="g.nl" class="lz-nl">⏎</span></span>
        </div>
        <div class="lz-note">{{ covered }} B repeat earlier bytes (runs of ≥ {{ MIN }} B)</div>
      </div>
      <div class="lz-out">
        <div class="lz-caption">LZ77: {{ literals }} literal bytes + {{ refs.length }} references (distance,length)</div>
        <div v-for="(segs, i) in linesOut" :key="i" class="lz-line">
          <template v-for="(g, j) in segs" :key="j">
            <span v-if="'ref' in g" class="lz-ref" :class="{ 'lz-ex': g.ref === 0 }">{{ label(g.ref) }}</span>
            <span v-else :class="{ 'lz-src': g.src }">{{ g.s }}<span v-if="g.nl" class="lz-nl">⏎</span></span>
          </template>
        </div>
        <div class="lz-note">{{ label(0) }}: go back {{ ex.dist }} bytes, copy {{ ex.len }}: ⏎{{ text.slice(ex.at + 1, ex.at + ex.len) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lz {
  --hl: 0;
  font-family: var(--slidev-code-font-family);
  font-size: 11px;
  font-variant-ligatures: none;
  color: var(--db-text-soft);
}
/* both versions in one grid cell: the spot keeps its size when they swap */
.lz-stack {
  display: grid;
}
.lz-stack > * {
  grid-area: 1 / 1;
}
.lz-caption,
.lz-note {
  color: var(--db-text);
}
.lz-caption {
  margin-bottom: 3px;
}
.lz-note {
  margin-top: 4px;
}
.lz-line {
  height: 16px;
  line-height: 16px;
  white-space: pre;
}
.lz-nl {
  color: #9a9a9a;
}
/* a thin white edge where two references meet */
.lz-m {
  border-radius: 2px;
  box-shadow: inset -1px 0 #fff;
  background: color-mix(in srgb, var(--tint-teal) calc(var(--hl) * 100%), transparent);
}
.lz-ref {
  padding: 1px 2px;
  border-radius: 2px;
  background: var(--tint-teal);
}
/* the worked example: a reference and the bytes it copies */
.lz-ex,
.lz-src {
  outline: 1.5px solid var(--db-accent1);
  outline-offset: -0.5px;
  border-radius: 2px;
}
</style>
