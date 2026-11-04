// Tints shared by the figures, tables and components. The colours themselves
// are CSS variables in style.css (brand colours mixed with white, so text on
// them stays readable); this maps names to them for use in inline styles.
export const TINT = {
  blue: 'var(--tint-blue)',
  teal: 'var(--tint-teal)',
  yellow: 'var(--tint-yellow)',
  purple: 'var(--tint-purple)',
  red: 'var(--tint-red)',
} as const

export type Tint = keyof typeof TINT
