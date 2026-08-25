import type { Recipe } from '../data/types'

export type ReelValues = [string, string, string]
export type ReelLocks = [boolean, boolean, boolean]

/**
 * Pick the recipe combination a spin should land on. Locked values are hard
 * constraints; unlocked values are filled from one eligible recipe so the
 * result card and the three reels always describe the same dish.
 */
export function selectSpinTarget(
  recipes: Recipe[],
  locks: ReelLocks,
  values: ReelValues,
  random: () => number = Math.random,
): ReelValues | null {
  const candidates = recipes.filter(
    (recipe) =>
      (!locks[0] || recipe.cuisine === values[0]) &&
      (!locks[1] || recipe.style === values[1]) &&
      (!locks[2] || recipe.proteinBase === values[2]),
  )

  if (candidates.length === 0) return null

  const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length))
  const target = candidates[index]
  return [target.cuisine, target.style, target.proteinBase]
}
