import type { Recipe, SpinResult } from '../data/types'

// Weights sum to ~1.0 so similarityScore returns a normalised 0..1 value.
const WEIGHTS = {
  cuisine: 0.22,
  style: 0.15,
  protein: 0.10,
  tags: 0.25,
  keyIngredients: 0.12,
  time: 0.10,
  spice: 0.06,
}

function jaccard(a: readonly string[], b: readonly string[]): number {
  if (a.length === 0 && b.length === 0) return 0
  const setA = new Set(a)
  const setB = new Set(b)
  let intersect = 0
  for (const x of setA) if (setB.has(x)) intersect++
  const union = setA.size + setB.size - intersect
  return union === 0 ? 0 : intersect / union
}

// 1 when identical, 0 when max plausible distance apart. Uses a soft 60-minute
// horizon — most everyday dishes cluster inside an hour.
function timeSimilarity(a: number, b: number): number {
  const diff = Math.abs(a - b)
  return Math.max(0, 1 - diff / 60)
}

function spiceSimilarity(a: number, b: number): number {
  return 1 - Math.abs(a - b) / 5
}

export function similarityScore(a: Recipe, b: Recipe): number {
  if (a.id === b.id) return 0
  let score = 0
  if (a.cuisine === b.cuisine) score += WEIGHTS.cuisine
  if (a.style === b.style) score += WEIGHTS.style
  if (a.proteinBase === b.proteinBase) score += WEIGHTS.protein
  score += jaccard(a.tags, b.tags) * WEIGHTS.tags
  score += jaccard(a.keyIngredients, b.keyIngredients) * WEIGHTS.keyIngredients
  score += timeSimilarity(a.totalTimeMinutes, b.totalTimeMinutes) * WEIGHTS.time
  score += spiceSimilarity(a.spiceLevel, b.spiceLevel) * WEIGHTS.spice
  return score
}

// Rank candidates by similarity to `seed`, returning top `n`. Ties broken by
// shorter total time (quicker recipes feel more "relevant" by default).
export function rankBySimilarity(
  seed: Recipe,
  candidates: readonly Recipe[],
  n = 4,
): Recipe[] {
  return [...candidates]
    .filter((r) => r.id !== seed.id)
    .map((r) => ({ r, score: similarityScore(seed, r) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.r.totalTimeMinutes - b.r.totalTimeMinutes
    })
    .slice(0, n)
    .map((x) => x.r)
}

// Score a recipe against a spin triple + meal type. Cheap fn used inside the
// matcher to rank results within a tier. Returns 0..1.
export function spinAlignment(
  r: Recipe,
  spin: Pick<SpinResult, 'cuisine' | 'style' | 'protein' | 'mealType'>,
): number {
  if (!r.mealTypes.includes(spin.mealType)) return 0
  let s = 0
  if (r.cuisine === spin.cuisine) s += 0.5
  if (r.style === spin.style) s += 0.3
  if (r.proteinBase === spin.protein) s += 0.2
  return s
}
