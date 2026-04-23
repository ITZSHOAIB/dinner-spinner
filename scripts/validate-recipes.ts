/**
 * Validate the recipe dataset. Run locally with `yarn validate-recipes`.
 * Also runs in CI on every PR that touches src/data/.
 *
 * Exits 0 on success, 1 on any validation failure.
 */

import { recipes } from '../src/data/recipes'
import { cuisineOptions, styleOptions, proteinOptions } from '../src/data/reelOptions'
import { CANONICAL_TAG_SET } from '../src/data/tagVocab'
import { normalizeTags, KNOWN_LEGACY_TAGS } from '../src/data/tagMigration'
import type { MealType, Recipe } from '../src/data/types'

type Issue = { recipeId: string; field: string; message: string }

const issues: Issue[] = []
const fail = (r: Recipe, field: string, message: string) =>
  issues.push({ recipeId: r.id || r.name || '(unknown)', field, message })

// ─────────────────────────────────────────────────────────────────────────────
// Rule: no duplicate ids
// ─────────────────────────────────────────────────────────────────────────────
const seenIds = new Map<string, number>()
for (const r of recipes) {
  seenIds.set(r.id, (seenIds.get(r.id) ?? 0) + 1)
}
for (const [id, count] of seenIds) {
  if (count > 1) {
    issues.push({ recipeId: id, field: 'id', message: `Duplicate id used ${count} times` })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-recipe rules
// ─────────────────────────────────────────────────────────────────────────────
const allCuisines = new Set<string>()
Object.values(cuisineOptions).forEach((list) => list.forEach((o) => allCuisines.add(o.value)))

for (const r of recipes) {
  // Cuisine must be in the reelOptions universe
  if (!allCuisines.has(r.cuisine)) {
    fail(r, 'cuisine', `"${r.cuisine}" is not a valid reelOptions cuisine`)
  }

  // For each mealType the recipe claims, cuisine/style/protein must be valid
  // for AT LEAST ONE of them. Otherwise the spinner can never land on it.
  let reachable = false
  for (const mt of r.mealTypes as MealType[]) {
    const cuisineOk = (cuisineOptions[mt] ?? []).some((o) => o.value === r.cuisine)
    const styleOk = (styleOptions[mt] ?? []).some((o) => o.value === r.style)
    const proteinOk = (proteinOptions[mt] ?? []).some((o) => o.value === r.proteinBase)
    if (cuisineOk && styleOk && proteinOk) {
      reachable = true
      break
    }
  }
  if (!reachable) {
    fail(
      r,
      'reel-reachability',
      `Not reachable via spinner: no declared mealType allows cuisine="${r.cuisine}", style="${r.style}", proteinBase="${r.proteinBase}"`,
    )
  }

  // Tag rules (two-tier):
  //  1) Every individual tag must be either canonical (in CANONICAL_TAG_SET)
  //     or a recognised legacy tag (KNOWN_LEGACY_TAGS — including those the
  //     migration drops as redundant). Unknown tags fail so typos are caught.
  //  2) After normalisation the recipe must retain ≥1 canonical tag so the
  //     similarity engine has something to work with.
  for (const tag of r.tags) {
    if (!CANONICAL_TAG_SET.has(tag) && !KNOWN_LEGACY_TAGS.has(tag)) {
      fail(
        r,
        'tags',
        `Tag "${tag}" is unknown. Add it to the migration map or pick from the canonical list (see CONTRIBUTING.md).`,
      )
    }
  }
  if (normalizeTags(r.tags).length === 0) {
    fail(
      r,
      'tags',
      `After normalisation, this recipe has no canonical tags left. Add at least one from CONTRIBUTING.md → Canonical tags.`,
    )
  }

  // Dietary flag consistency
  const d = r.dietary
  if (d.isVegetarian && d.isNonVeg) {
    fail(r, 'dietary', 'isVegetarian and isNonVeg cannot both be true')
  }
  if (d.isVegan && !d.isVegetarian) {
    fail(r, 'dietary', 'isVegan implies isVegetarian — must also be true')
  }
  if (d.isVegan && !d.isDairyFree) {
    fail(r, 'dietary', 'isVegan implies isDairyFree')
  }
  if (d.isVegan && d.isEgg) {
    fail(r, 'dietary', 'isVegan and isEgg cannot both be true')
  }

  // Protein ↔ dietary cross-check
  const nonVegProteins = new Set(['Chicken', 'Fish', 'Mutton', 'Prawn'])
  const vegProteins = new Set(['Paneer', 'Lentils', 'Veggies'])
  if (nonVegProteins.has(r.proteinBase) && !d.isNonVeg) {
    fail(r, 'dietary', `proteinBase=${r.proteinBase} requires isNonVeg=true`)
  }
  if (vegProteins.has(r.proteinBase) && d.isNonVeg) {
    fail(r, 'dietary', `proteinBase=${r.proteinBase} requires isNonVeg=false`)
  }
  if (vegProteins.has(r.proteinBase) && !d.isVegetarian) {
    fail(r, 'dietary', `proteinBase=${r.proteinBase} requires isVegetarian=true`)
  }

  // Time sanity: totalTime should be ≥ prep+cook (it can exceed due to
  // marinating, fermenting, setting times). Only fail when it's clearly less.
  const minTotal = r.prepTimeMinutes + r.cookTimeMinutes
  if (r.totalTimeMinutes < minTotal - 5) {
    fail(
      r,
      'time',
      `totalTimeMinutes (${r.totalTimeMinutes}) is less than prep+cook (${minTotal})`,
    )
  }

  // Basic content depth
  if (r.description.length < 30) fail(r, 'description', 'description looks thin (<30 chars)')
  if (r.ingredients.length < 3) fail(r, 'ingredients', 'needs at least 3 ingredients')
  if (r.keyIngredients.length < 2) fail(r, 'keyIngredients', 'needs at least 2 key ingredients')
  if (r.steps.length < 2) fail(r, 'steps', 'needs at least 2 steps')
}

// ─────────────────────────────────────────────────────────────────────────────
// Report
// ─────────────────────────────────────────────────────────────────────────────
console.log(`Validated ${recipes.length} recipes.`)
if (issues.length === 0) {
  console.log('✓ All checks passed.')
  process.exit(0)
}

console.error(`\n✗ ${issues.length} issue(s) found:\n`)
const grouped = new Map<string, Issue[]>()
for (const i of issues) {
  if (!grouped.has(i.recipeId)) grouped.set(i.recipeId, [])
  grouped.get(i.recipeId)!.push(i)
}
for (const [id, list] of grouped) {
  console.error(`  • ${id}`)
  for (const i of list) console.error(`      [${i.field}] ${i.message}`)
}
console.error('')
process.exit(1)
