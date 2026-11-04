import { TINT } from './palette'

// The lecture's running example: a tiny `orders` table, small enough to draw
// every value. ROWS lists the orders in arrival order; the file starts out
// SCRAMBLED (as if collected from many shops) until the zone-map slides sort it.

export interface Column {
  name: string
  type: 'DATE' | 'INT32' | 'STRING' | 'DECIMAL(10,2)'
  tint: string
}

export const COLS: Column[] = [
  { name: 'created_at', type: 'DATE', tint: TINT.blue },
  { name: 'product_id', type: 'INT32', tint: TINT.purple },
  { name: 'country', type: 'STRING', tint: TINT.yellow },
  { name: 'revenue', type: 'DECIMAL(10,2)', tint: TINT.teal },
]

export type Value = string | number

export const ROWS: Value[][] = [
  ['2026-10-08', 101, 'Germany', 19.99],
  ['2026-10-08', 103, 'France', 5.49],
  ['2026-10-09', 101, 'Germany', 19.99],
  ['2026-10-10', 104, 'Germany', 12.0],
  ['2026-10-10', 102, 'Poland', 7.25],
  ['2026-10-10', 103, 'Germany', 5.49],
  ['2026-10-11', 112, 'France', 49.0],
  ['2026-10-12', 104, 'Germany', 12.0],
  ['2026-10-12', 112, 'Poland', 49.0],
]

/** Row order in the file before anyone sorts it: every row group spans 10-10. */
export const SCRAMBLED = [6, 0, 3, 7, 4, 5, 2, 8, 1]
export const ARRIVAL = [0, 1, 2, 3, 4, 5, 6, 7, 8]

export const GROUP_SIZE = 3

/** Dictionary for `country`, as stored in the footer. */
export const DICT = ['France', 'Germany', 'Poland']

/** A value as it is written in a CSV file. */
export function csvText(c: number, v: Value): string {
  return COLS[c].type === 'DECIMAL(10,2)' ? (v as number).toFixed(2) : String(v)
}
