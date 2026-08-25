import assert from 'node:assert/strict'
import { selectSpinTarget } from '../src/lib/spinTarget.ts'
import type { Recipe } from '../src/data/types.ts'

const dinnerRecipes: Recipe[] = [
  {
    id: 'bengali-fish-curry', name: 'Bengali Fish Curry', description: '',
    cuisine: 'Bengali', style: 'Curry', proteinBase: 'Fish', mealTypes: ['dinner'],
    dietary: { isVegetarian: false, isVegan: false, isNonVeg: true, isEgg: false, isGlutenFree: true, isDairyFree: true },
    prepTimeMinutes: 10, cookTimeMinutes: 20, totalTimeMinutes: 30, difficulty: 'easy',
    servings: 2, spiceLevel: 2, ingredients: [], keyIngredients: [], steps: [], tags: [],
  },
  {
    id: 'north-indian-paneer', name: 'North Indian Paneer', description: '',
    cuisine: 'North Indian', style: 'Curry', proteinBase: 'Paneer', mealTypes: ['dinner'],
    dietary: { isVegetarian: true, isVegan: false, isNonVeg: false, isEgg: false, isGlutenFree: true, isDairyFree: false },
    prepTimeMinutes: 10, cookTimeMinutes: 20, totalTimeMinutes: 30, difficulty: 'easy',
    servings: 2, spiceLevel: 2, ingredients: [], keyIngredients: [], steps: [], tags: [],
  },
]

const singleLockCases: Array<{
  locks: [boolean, boolean, boolean]
  values: [string, string, string]
  index: 0 | 1 | 2
  expected: string
  label: string
}> = [
  { locks: [true, false, false], values: ['Bengali', '', ''], index: 0, expected: 'Bengali', label: 'cuisine' },
  { locks: [false, true, false], values: ['', 'Curry', ''], index: 1, expected: 'Curry', label: 'style' },
  { locks: [false, false, true], values: ['', '', 'Paneer'], index: 2, expected: 'Paneer', label: 'protein' },
]

for (const { locks, values, index, expected, label } of singleLockCases) {
  const target = selectSpinTarget(dinnerRecipes, locks, values, () => 0)
  assert.equal(target?.[index], expected, `a locked ${label} must not change during a spin`)
}

const knownRecipe = dinnerRecipes[0]
const allLockedTarget = selectSpinTarget(
  dinnerRecipes,
  [true, true, true],
  [knownRecipe.cuisine, knownRecipe.style, knownRecipe.proteinBase],
  () => 0,
)
assert.deepEqual(allLockedTarget, [knownRecipe.cuisine, knownRecipe.style, knownRecipe.proteinBase])

const impossibleTarget = selectSpinTarget(
  dinnerRecipes,
  [true, false, false],
  ['Not a cuisine', '', ''],
  () => 0,
)
assert.equal(impossibleTarget, null, 'impossible lock constraints must not produce a false match')

console.log('Spinner target selection verified')
