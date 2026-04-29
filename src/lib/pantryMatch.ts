// Pantry-mode matching: given a user's pantry (canonical ingredient ids) and
// a recipe, decide whether it's cookable, almost-cookable, or further away.
//
// Matches against recipe.keyIngredients (already curated short labels) rather
// than the free-text ingredients[] strings. Implicit staples + spices are
// subtracted from the "required" set so users aren't told a curry is uncook-
// able because they don't have ground cumin.

import type { Recipe } from '../data/types'
import {
  allStapleIds,
  canonicalIngredients,
  ingredientLookup,
  type CanonicalIngredient,
} from '../data/ingredients'

/** Map a single recipe keyIngredient string to a canonical id, if known. */
export function resolveCanonicalId(raw: string): string | null {
  const norm = raw.trim().toLowerCase()
  if (ingredientLookup.has(norm)) return ingredientLookup.get(norm)!

  // Plural-tolerant fallback: drop trailing "s" / "es".
  if (norm.endsWith('es') && ingredientLookup.has(norm.slice(0, -2))) {
    return ingredientLookup.get(norm.slice(0, -2))!
  }
  if (norm.endsWith('s') && ingredientLookup.has(norm.slice(0, -1))) {
    return ingredientLookup.get(norm.slice(0, -1))!
  }

  // Substring fallback: any synonym/label appears as a whole word inside
  // the raw string (handles "Chicken thigh", "Whole roasted coconut", etc.).
  for (const [key, id] of ingredientLookup) {
    const re = new RegExp(`\\b${escapeRegex(key)}\\b`)
    if (re.test(norm)) return id
  }
  return null
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export interface RecipeMatch {
  recipe: Recipe
  /** Canonical ids the recipe needs, with staples/spices already excluded. */
  required: string[]
  /** Required ids the user already has in their pantry. */
  have: string[]
  /** Required ids missing from the pantry. */
  missing: string[]
}

export interface ScoreOptions {
  /** Ids the user explicitly removed from their staple defaults. */
  excludedStapleIds?: string[]
}

/**
 * Build the set of canonical ingredients each recipe truly requires, after
 * subtracting implicit staples (and any default staples the user has *kept*).
 * Returns a stable per-recipe list — does not depend on the pantry.
 */
export function getRequiredCanonicalIds(
  recipe: Recipe,
  excludedStapleIds: string[] = [],
): string[] {
  const excluded = new Set(excludedStapleIds)
  const required = new Set<string>()
  for (const raw of recipe.keyIngredients) {
    const id = resolveCanonicalId(raw)
    if (!id) continue
    // Implicit staple/spice — but if user explicitly excluded it, treat as required.
    if (allStapleIds.has(id) && !excluded.has(id)) continue
    required.add(id)
  }
  return [...required]
}

export function scoreRecipe(
  recipe: Recipe,
  pantryIds: string[],
  options: ScoreOptions = {},
): RecipeMatch {
  const required = getRequiredCanonicalIds(recipe, options.excludedStapleIds)
  const pantry = new Set(pantryIds)
  const have: string[] = []
  const missing: string[] = []
  for (const id of required) {
    if (pantry.has(id)) have.push(id)
    else missing.push(id)
  }
  return { recipe, required, have, missing }
}

export type Bucket = 'cookable' | 'one-away' | 'two-away' | 'three-plus' | 'far'

export function bucketFor(missingCount: number, requiredCount: number): Bucket {
  if (requiredCount === 0) return 'far' // No identifiable ingredients — don't surface
  if (missingCount === 0) return 'cookable'
  if (missingCount === 1) return 'one-away'
  if (missingCount === 2) return 'two-away'
  if (missingCount === 3) return 'three-plus'
  return 'far'
}

export interface BucketedMatches {
  cookable: RecipeMatch[]
  oneAway: RecipeMatch[]
  twoAway: RecipeMatch[]
  threePlus: RecipeMatch[]
  /** Top 3 nearest matches when nothing else qualifies (empty otherwise). */
  closest: RecipeMatch[]
}

export function bucketMatches(
  recipes: Recipe[],
  pantryIds: string[],
  options: ScoreOptions = {},
): BucketedMatches {
  const cookable: RecipeMatch[] = []
  const oneAway: RecipeMatch[] = []
  const twoAway: RecipeMatch[] = []
  const threePlus: RecipeMatch[] = []
  const all: RecipeMatch[] = []

  for (const r of recipes) {
    const m = scoreRecipe(r, pantryIds, options)
    if (m.required.length === 0) continue
    all.push(m)
    const b = bucketFor(m.missing.length, m.required.length)
    if (b === 'cookable') cookable.push(m)
    else if (b === 'one-away') oneAway.push(m)
    else if (b === 'two-away') twoAway.push(m)
    else if (b === 'three-plus') threePlus.push(m)
  }

  // Sort each bucket: more matches first, shorter cook time as tiebreak.
  const sorter = (a: RecipeMatch, b: RecipeMatch) => {
    const haveDiff = b.have.length - a.have.length
    if (haveDiff !== 0) return haveDiff
    return a.recipe.totalTimeMinutes - b.recipe.totalTimeMinutes
  }
  cookable.sort(sorter)
  oneAway.sort(sorter)
  twoAway.sort(sorter)
  threePlus.sort(sorter)

  // Closest: only populated when nothing in the cookable/one-away buckets
  // — gives the user a non-empty result when their pantry is sparse.
  let closest: RecipeMatch[] = []
  if (cookable.length === 0 && oneAway.length === 0) {
    closest = [...all]
      .sort((a, b) => {
        const ratioA = a.have.length / a.required.length
        const ratioB = b.have.length / b.required.length
        if (ratioA !== ratioB) return ratioB - ratioA
        return a.missing.length - b.missing.length
      })
      .slice(0, 3)
  }

  return { cookable, oneAway, twoAway, threePlus, closest }
}

/** Quick helper for the autocomplete input. */
export function searchCatalog(query: string): CanonicalIngredient[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const exact: CanonicalIngredient[] = []
  const prefix: CanonicalIngredient[] = []
  const contains: CanonicalIngredient[] = []
  for (const ing of canonicalIngredients) {
    if (ing.category === 'staple' || ing.category === 'spice') continue
    const all = [ing.label.toLowerCase(), ...ing.synonyms.map((s) => s.toLowerCase())]
    if (all.includes(q)) exact.push(ing)
    else if (all.some((s) => s.startsWith(q))) prefix.push(ing)
    else if (all.some((s) => s.includes(q))) contains.push(ing)
  }
  return [...exact, ...prefix, ...contains].slice(0, 8)
}
