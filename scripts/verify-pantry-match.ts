// Verification script for pantry matching. Not a real test suite — just
// sanity asserts that exercise the canonical-resolution and bucketing logic
// against the live recipe dataset.
//
// Run: yarn tsx scripts/verify-pantry-match.ts

import assert from 'node:assert/strict'
import { recipes } from '../src/data/recipes'
import {
  bucketMatches,
  resolveCanonicalId,
  scoreRecipe,
} from '../src/lib/pantryMatch'

let passed = 0
let failed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    console.log(`  ✓ ${name}`)
    passed++
  } catch (e) {
    console.error(`  ✗ ${name}`)
    console.error(`    ${(e as Error).message}`)
    failed++
  }
}

console.log('\n— resolveCanonicalId —')
check('resolves exact label', () => {
  assert.equal(resolveCanonicalId('Chicken'), 'chicken')
})
check('resolves synonym (rohu fish → fish)', () => {
  assert.equal(resolveCanonicalId('Rohu fish'), 'fish')
})
check('resolves synonym (chingri → prawns)', () => {
  assert.equal(resolveCanonicalId('chingri'), 'prawns')
})
check('plural fallback (Tomatoes → tomato)', () => {
  assert.equal(resolveCanonicalId('Tomatoes'), 'tomato')
})
check('case-insensitive', () => {
  assert.equal(resolveCanonicalId('PANEER'), 'paneer')
})
check('substring match (Whole roasted coconut → coconut)', () => {
  assert.equal(resolveCanonicalId('Whole roasted coconut'), 'coconut')
})
check('returns null for unknown', () => {
  assert.equal(resolveCanonicalId('Unobtainium'), null)
})

console.log('\n— scoreRecipe —')
const macher = recipes.find((r) => r.id === 'macher-jhol')!
check('macher-jhol requires fish + potato (others are staples)', () => {
  const m = scoreRecipe(macher, [])
  assert.deepEqual(m.required.sort(), ['fish', 'potato'])
  assert.equal(m.missing.length, 2)
})
check('macher-jhol with fish in pantry → 1 missing', () => {
  const m = scoreRecipe(macher, ['fish'])
  assert.equal(m.have.length, 1)
  assert.equal(m.missing.length, 1)
  assert.deepEqual(m.missing, ['potato'])
})
check('macher-jhol with fish + potato → cookable', () => {
  const m = scoreRecipe(macher, ['fish', 'potato'])
  assert.equal(m.missing.length, 0)
})

check('toggling off mustard-oil staple makes it required', () => {
  const m = scoreRecipe(macher, ['fish', 'potato'], {
    excludedStapleIds: ['mustard-oil'],
  })
  assert.ok(m.required.includes('mustard-oil'))
  assert.deepEqual(m.missing, ['mustard-oil'])
})

console.log('\n— bucketMatches —')
check('empty pantry → no cookable; one-away populated', () => {
  const r = bucketMatches(recipes, [])
  assert.equal(r.cookable.length, 0, 'no recipe should be cookable with empty pantry')
  assert.ok(r.oneAway.length > 0, 'expected single-ingredient recipes to surface')
})

check('closest activates only when nothing else qualifies', () => {
  // Pantry with one obscure ingredient → no cookable / one-away
  const r = bucketMatches(recipes, ['banana-blossom'])
  assert.equal(r.cookable.length, 0)
  // closest should have ≤3 entries (or 0 if oneAway populated)
  assert.ok(r.closest.length <= 3)
})

check('rich pantry surfaces cookable', () => {
  const pantry = [
    'chicken', 'fish', 'paneer', 'eggs', 'yogurt', 'milk', 'cream', 'butter',
    'tomato', 'potato', 'onion', 'green-chilli', 'bell-pepper', 'spinach',
    'rice', 'flour', 'noodles', 'bread',
    'chickpeas', 'chana-dal', 'toor-dal', 'besan',
    'coconut', 'peanuts', 'curry-leaves', 'coriander',
    'lemon',
  ]
  const r = bucketMatches(recipes, pantry)
  console.log(`    cookable=${r.cookable.length} one-away=${r.oneAway.length} two-away=${r.twoAway.length}`)
  assert.ok(r.cookable.length > 5, 'expected at least 5 cookable recipes')
})

console.log('\n— Coverage report —')
let resolvedCount = 0
let totalKey = 0
const unresolved = new Set<string>()
for (const r of recipes) {
  for (const k of r.keyIngredients) {
    totalKey++
    if (resolveCanonicalId(k)) resolvedCount++
    else unresolved.add(k)
  }
}
console.log(`  ${resolvedCount}/${totalKey} keyIngredient strings resolve to canonical (${((resolvedCount / totalKey) * 100).toFixed(1)}%)`)
if (unresolved.size > 0) {
  console.log(`  ${unresolved.size} unresolved keys (will be ignored, treated as staples):`)
  for (const u of [...unresolved].sort()) console.log(`    - ${u}`)
}

const recipesWithNoRequired = recipes.filter(
  (r) => scoreRecipe(r, []).required.length === 0,
).length
console.log(`  ${recipesWithNoRequired}/${recipes.length} recipes have no canonical required ingredients (won't surface in pantry mode)`)

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
