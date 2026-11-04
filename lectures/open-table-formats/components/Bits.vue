<script setup lang="ts">
import { computed } from 'vue'
import type { Tint } from '../palette'
import { TINT } from '../palette'

// Integers in binary, for the bit-packing figures. Every value is `width` bit
// cells, most significant first; bits above the lowest `sig` are padding
// (leading zeros), drawn grey. By default one value per line, labelled with
// its decimal value and grouped into bytes; `packed` writes all values into one
// strip, as a bit-packed block stores them. Hooks for timelines: value i is
// .bt-v<i>, made of its padding .bt-pads and its significant bits .bt-sigs.
const props = withDefaults(defineProps<{
  values: number[]
  width: number
  sig?: number
  tint?: Tint
  packed?: boolean
  caption?: string
  note?: string
}>(), { tint: 'purple', packed: false })

const pad = computed(() => props.width - (props.sig ?? props.width))
const labelWidth = computed(() => `${Math.max(...props.values.map(v => String(v).length))}ch`)
const bits = (v: number) => v.toString(2).padStart(props.width, '0').split('')
// gap after every byte (counted from the least significant bit), unpacked only
const byteEnd = (j: number) => !props.packed && j < props.width - 1 && (props.width - 1 - j) % 8 === 0
</script>

<template>
  <div class="bt" :style="{ '--tint': TINT[props.tint] }">
    <div v-if="props.caption" class="bt-caption">{{ props.caption }}</div>
    <div v-for="(row, r) in props.packed ? [props.values] : props.values.map(v => [v])" :key="r" class="bt-row">
      <span v-if="!props.packed" class="bt-label" :style="{ width: labelWidth }">{{ row[0] }}</span>
      <span v-for="(v, k) in row" :key="k" class="bt-val" :class="`bt-v${props.packed ? k : r}`">
        <span v-if="pad > 0" class="bt-pads">
          <span v-for="(b, j) in bits(v).slice(0, pad)" :key="j" class="bt-bit" :class="{ 'bt-byte': byteEnd(j) }">{{ b }}</span>
        </span>
        <span class="bt-sigs">
          <span v-for="(b, j) in bits(v).slice(pad)" :key="j" class="bt-bit" :class="{ 'bt-byte': byteEnd(pad + j) }">{{ b }}</span>
        </span>
      </span>
      <span v-if="props.note && (props.packed || r === props.values.length - 1)" class="bt-note">{{ props.note }}</span>
    </div>
  </div>
</template>

<style scoped>
.bt {
  font-family: var(--slidev-code-font-family);
  font-size: 10px;
  line-height: 1.2;
  color: var(--db-text-soft);
}
.bt-caption {
  margin-bottom: 3px;
  font-size: 10px;
  color: var(--db-text);
}
.bt-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.bt-row + .bt-row {
  margin-top: 2px;
}
.bt-label {
  flex: none;
  text-align: right;
  color: var(--db-text);
}
.bt-val,
.bt-pads,
.bt-sigs {
  display: inline-flex;
  flex: none;
  gap: 1px;
}
.bt-bit {
  display: inline-grid;
  place-items: center;
  width: 10px;
  height: 17px;
  border-radius: 1px;
  font-size: 9px;
  background: var(--tint);
}
.bt-pads .bt-bit {
  color: #9a9a9a;
  background: #ececec;
}
.bt-byte {
  margin-right: 3px;
}
.bt-note {
  margin-left: 6px;
  color: var(--db-text);
  white-space: nowrap;
}
</style>
