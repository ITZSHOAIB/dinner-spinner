// Recipe-catalog gap audit. Reports counts by every facet that matters for
// browse/spin/pantry, plus the spinner combinations (cuisine × style ×
// protein × meal) where coverage is 0 or 1.
//
// Run: yarn tsx scripts/audit-recipes.ts

import { recipes } from '../src/data/recipes'
import {
  cuisineOptions,
  styleOptions,
  proteinOptions,
} from '../src/data/reelOptions'
import type { MealType } from '../src/data/types'

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks']

function tally<T extends string | number>(items: T[]): Map<T, number> {
  const m = new Map<T, number>()
  for (const x of items) m.set(x, (m.get(x) ?? 0) + 1)
  return m
}

function printTally(title: string, m: Map<string, number>, total: number) {
  console.log(`\n${title}`)
  const sorted = [...m.entries()].sort((a, b) => b[1] - a[1])
  for (const [k, n] of sorted) {
    const pct = ((n / total) * 100).toFixed(0).padStart(3)
    const bar = '█'.repeat(Math.round((n / Math.max(...m.values())) * 24))
    console.log(`  ${k.padEnd(20)} ${String(n).padStart(3)}  ${pct}%  ${bar}`)
  }
}

// ── 1. Headline counts ──────────────────────────────────────
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`  RECIPE CATALOG AUDIT — ${recipes.length} recipes`)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

// Cuisine
printTally('▌Cuisine', tally(recipes.map((r) => r.cuisine)), recipes.length)

// Meal type (recipes appear in multiple)
const mealCount = new Map<string, number>()
for (const r of recipes) for (const m of r.mealTypes) mealCount.set(m, (mealCount.get(m) ?? 0) + 1)
printTally('▌Meal types (recipes can have many)', mealCount, recipes.length)

// Style
printTally('▌Style', tally(recipes.map((r) => r.style)), recipes.length)

// Protein base
printTally('▌Protein base', tally(recipes.map((r) => r.proteinBase)), recipes.length)

// Difficulty
printTally('▌Difficulty', tally(recipes.map((r) => r.difficulty)), recipes.length)

// Time buckets
const timeBucket = (m: number) =>
  m <= 15 ? '≤15 min (snap)' :
  m <= 30 ? '16–30 min (quick)' :
  m <= 45 ? '31–45 min (weeknight)' :
  m <= 60 ? '46–60 min (project)' :
  '60+ min (slow cook)'
printTally('▌Total time bucket', tally(recipes.map((r) => timeBucket(r.totalTimeMinutes))), recipes.length)

// Dietary
const diet = {
  vegetarian: 0,
  vegan: 0,
  'non-veg': 0,
  egg: 0,
  'gluten-free': 0,
  'dairy-free': 0,
}
for (const r of recipes) {
  if (r.dietary.isVegetarian) diet.vegetarian++
  if (r.dietary.isVegan) diet.vegan++
  if (r.dietary.isNonVeg) diet['non-veg']++
  if (r.dietary.isEgg) diet.egg++
  if (r.dietary.isGlutenFree) diet['gluten-free']++
  if (r.dietary.isDairyFree) diet['dairy-free']++
}
printTally('▌Dietary (overlapping)', new Map(Object.entries(diet)), recipes.length)

// Spice level
printTally('▌Spice level', tally(recipes.map((r) => `${r.spiceLevel}/5`)), recipes.length)

// ── 2. Spinner combinatorial coverage ───────────────────────
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('  SPINNER COVERAGE — cells with 0 or 1 recipes')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

interface CellMiss {
  meal: MealType
  cuisine: string
  style: string
  protein: string
  matches: number
}
const empty: CellMiss[] = []
const sparse: CellMiss[] = []

for (const meal of MEAL_TYPES) {
  for (const cuisine of cuisineOptions[meal]) {
    for (const style of styleOptions[meal]) {
      for (const protein of proteinOptions[meal]) {
        const count = recipes.filter(
          (r) =>
            r.mealTypes.includes(meal) &&
            r.cuisine === cuisine.value &&
            r.style === style.value &&
            r.proteinBase === protein.value,
        ).length
        const cell: CellMiss = {
          meal,
          cuisine: cuisine.value,
          style: style.value,
          protein: protein.value,
          matches: count,
        }
        if (count === 0) empty.push(cell)
        else if (count === 1) sparse.push(cell)
      }
    }
  }
}

const totalCells =
  MEAL_TYPES.reduce(
    (sum, m) =>
      sum +
      cuisineOptions[m].length * styleOptions[m].length * proteinOptions[m].length,
    0,
  )
const filledExact = totalCells - empty.length

console.log(`\n  Total spinner cells: ${totalCells.toLocaleString()}`)
console.log(`  Cells with 0 recipes: ${empty.length.toLocaleString()} (${((empty.length / totalCells) * 100).toFixed(1)}%)`)
console.log(`  Cells with 1 recipe:  ${sparse.length.toLocaleString()} (${((sparse.length / totalCells) * 100).toFixed(1)}%)`)
console.log(`  Cells with ≥2:        ${(filledExact - sparse.length).toLocaleString()} (${(((filledExact - sparse.length) / totalCells) * 100).toFixed(1)}%)`)

// Note: the spinner falls back gracefully (cuisine+style or cuisine-only)
// when an exact triple has 0 matches, so 0-cells aren't always dead-ends —
// but they ARE points where the user sees "no exact match" copy.

// ── 3. By-meal spinner heatmap (rows=cuisines, cols=styles) ─
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('  COVERAGE HEATMAP — recipes per cuisine × style')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

for (const meal of MEAL_TYPES) {
  console.log(`\n▌${meal.toUpperCase()}`)
  const styles = styleOptions[meal].map((s) => s.value)
  const cuisines = cuisineOptions[meal].map((c) => c.value)

  // Header
  const styleLabel = (s: string) => s.slice(0, 9).padEnd(9)
  console.log(`  ${' '.repeat(20)}` + styles.map(styleLabel).join(''))

  for (const c of cuisines) {
    const row = styles.map((s) => {
      const n = recipes.filter(
        (r) => r.mealTypes.includes(meal) && r.cuisine === c && r.style === s,
      ).length
      const cell = n === 0 ? '·' : String(n)
      return cell.padEnd(9)
    })
    console.log(`  ${c.padEnd(20)}${row.join('')}`)
  }
}

// ── 4. Filter dead-ends ─────────────────────────────────────
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('  FILTER DEAD-ENDS — meal × dietary')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const dietaryDimensions: { key: keyof typeof diet; field: keyof typeof recipes[0]['dietary'] }[] = [
  { key: 'vegetarian', field: 'isVegetarian' },
  { key: 'vegan', field: 'isVegan' },
  { key: 'gluten-free', field: 'isGlutenFree' },
  { key: 'dairy-free', field: 'isDairyFree' },
]

console.log(
  `  ${'Meal type'.padEnd(13)}` +
    dietaryDimensions.map((d) => d.key.padEnd(14)).join(''),
)
for (const meal of MEAL_TYPES) {
  const row = dietaryDimensions.map((d) => {
    const n = recipes.filter(
      (r) => r.mealTypes.includes(meal) && r.dietary[d.field],
    ).length
    return String(n).padEnd(14)
  })
  console.log(`  ${meal.padEnd(13)}${row.join('')}`)
}

// ── 5. Quick-meal coverage by cuisine ───────────────────────
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('  QUICK-MEAL COVERAGE — recipes ≤30 min by cuisine')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
const quickByCuisine = new Map<string, number>()
for (const r of recipes) {
  if (r.totalTimeMinutes <= 30) {
    quickByCuisine.set(r.cuisine, (quickByCuisine.get(r.cuisine) ?? 0) + 1)
  }
}
for (const c of [...new Set(recipes.map((r) => r.cuisine))].sort()) {
  const total = recipes.filter((r) => r.cuisine === c).length
  const quick = quickByCuisine.get(c) ?? 0
  const flag = quick === 0 ? '  ⚠ no quick options' : quick < 2 ? '  ⚠ thin' : ''
  console.log(`  ${c.padEnd(20)} ${String(quick).padStart(2)} of ${String(total).padStart(2)}${flag}`)
}

// ── 6. Top 0-cell hotspots — most "interesting" gaps ────────
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('  TOP GAP HOTSPOTS — cuisine+meal pairs with most 0-cells')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
const hotspots = new Map<string, number>()
for (const e of empty) {
  const k = `${e.cuisine} (${e.meal})`
  hotspots.set(k, (hotspots.get(k) ?? 0) + 1)
}
const topHotspots = [...hotspots.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
for (const [k, n] of topHotspots) {
  console.log(`  ${k.padEnd(35)} ${n} empty triples`)
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
