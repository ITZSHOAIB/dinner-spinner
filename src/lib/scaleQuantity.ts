// Parse and rescale the leading numeric quantity of an ingredient string.
// Handles: `500g`, `2 tsp`, `1.5 cups`, `1/2 tsp`, `1 1/2 tsp`, `8-10 curry leaves`.
// Lines with no leading numeric (`Salt to taste`, `A pinch of asafoetida`) are
// returned unchanged.

const MIXED = /^(\d+)\s+(\d+)\/(\d+)$/
const FRACTION = /^(\d+)\/(\d+)$/

function parseQty(s: string): number {
  const mixed = s.match(MIXED)
  if (mixed) return +mixed[1] + +mixed[2] / +mixed[3]
  const frac = s.match(FRACTION)
  if (frac) return +frac[1] / +frac[2]
  return parseFloat(s)
}

function formatQty(n: number): string {
  if (Number.isInteger(n)) return String(n)
  // Snap to nice culinary fractions when close enough.
  const fractions: [number, string][] = [
    [0.125, '1/8'], [0.25, '1/4'], [0.333, '1/3'], [0.375, '3/8'],
    [0.5, '1/2'], [0.625, '5/8'], [0.667, '2/3'], [0.75, '3/4'], [0.875, '7/8'],
  ]
  const whole = Math.floor(n)
  const frac = n - whole
  for (const [val, repr] of fractions) {
    if (Math.abs(frac - val) < 0.03) {
      return whole > 0 ? `${whole} ${repr}` : repr
    }
  }
  return n.toFixed(1).replace(/\.0$/, '')
}

export function scaleIngredient(line: string, factor: number): string {
  if (factor === 1) return line

  // Range: "8-10 curry leaves" → scale both endpoints.
  const range = line.match(/^(\d+)-(\d+)(\s*)(.*)$/s)
  if (range) {
    const low = formatQty(+range[1] * factor)
    const high = formatQty(+range[2] * factor)
    return `${low}-${high}${range[3]}${range[4]}`
  }

  // Leading quantity: integer, decimal, fraction, or mixed number.
  const m = line.match(/^(\d+(?:\s+\d+\/\d+)|\d*\.\d+|\d+\/\d+|\d+)(\s*)(.*)$/s)
  if (!m) return line
  const n = parseQty(m[1])
  if (!isFinite(n)) return line
  return `${formatQty(n * factor)}${m[2]}${m[3]}`
}
