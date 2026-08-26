import { create } from 'zustand'
import type { MealType, Recipe } from '../data/types'
import { spinAlignment } from '../lib/similarity'
import { recipes as rawRecipes } from '../data/recipes'
import { normalizeTags } from '../data/tagMigration'

const mealPreferenceFilters = new Set(['veg-only', 'egg-ok', 'non-veg'])

export function normalizeDietaryFilters(filters: string[]): string[] {
  let mealPreference: string | null = null
  const otherFilters: string[] = []

  for (const filter of filters) {
    if (mealPreferenceFilters.has(filter)) mealPreference = filter
    else if (!otherFilters.includes(filter)) otherFilters.push(filter)
  }

  return mealPreference ? [mealPreference, ...otherFilters] : otherFilters
}

// Normalise tags through the controlled vocabulary at module load so the store
// is populated synchronously. Avoids a render race where deep-linked pages
// (e.g. /recipes/:id on refresh) see an empty store and show "Recipe not found".
const initialRecipes: Recipe[] = rawRecipes.map((r) => ({
  ...r,
  tags: normalizeTags(r.tags),
}))

export interface MatchOptions {
  maxTimeMinutes?: number
  dietaryFilters?: string[]
}

export function passesDietary(r: Recipe, filters: string[]): boolean {
  for (const f of filters) {
    switch (f) {
      case 'vegetarian': if (!r.dietary.isVegetarian) return false; break
      case 'veg-only': if (!r.dietary.isVegetarian || r.dietary.isEgg) return false; break
      case 'egg-ok': if (!r.dietary.isVegetarian && !r.dietary.isEgg) return false; break
      case 'vegan': if (!r.dietary.isVegan) return false; break
      case 'non-veg': if (!r.dietary.isNonVeg) return false; break
      case 'egg': if (!r.dietary.isEgg) return false; break
      case 'gluten-free': if (!r.dietary.isGlutenFree) return false; break
      case 'dairy-free': if (!r.dietary.isDairyFree) return false; break
    }
  }
  return true
}

interface RecipeState {
  recipes: Recipe[]
  setRecipes: (recipes: Recipe[]) => void

  // Search & filters
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeDietaryFilters: string[]
  toggleDietaryFilter: (filter: string) => void
  clearDietaryFilters: () => void
  activeCuisineFilter: string | null
  setCuisineFilter: (cuisine: string | null) => void
  activeMealTypeFilter: MealType | null
  setMealTypeFilter: (type: MealType | null) => void

  // Derived
  getFilteredRecipes: () => Recipe[]
  getRecipeById: (id: string) => Recipe | undefined
  getSpinCandidates: (mealType: MealType, options?: MatchOptions) => Recipe[]
  getMatchingRecipes: (
    cuisine: string,
    style: string,
    protein: string,
    mealType: MealType,
    options?: MatchOptions,
  ) => Recipe[]
}

export const useRecipeStore = create<RecipeState>()((set, get) => ({
  recipes: initialRecipes,
  setRecipes: (recipes) => set({ recipes }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  activeDietaryFilters: [],
  toggleDietaryFilter: (filter) =>
    set((state) => {
      if (state.activeDietaryFilters.includes(filter)) {
        return { activeDietaryFilters: state.activeDietaryFilters.filter((f) => f !== filter) }
      }

      return {
        activeDietaryFilters: normalizeDietaryFilters([...state.activeDietaryFilters, filter]),
      }
    }),
  clearDietaryFilters: () => set({ activeDietaryFilters: [] }),

  activeCuisineFilter: null,
  setCuisineFilter: (cuisine) => set({ activeCuisineFilter: cuisine }),

  activeMealTypeFilter: null,
  setMealTypeFilter: (type) => set({ activeMealTypeFilter: type }),

  getFilteredRecipes: () => {
    const { recipes, searchQuery, activeDietaryFilters, activeCuisineFilter, activeMealTypeFilter } = get()
    let filtered = recipes

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.nameLocal?.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.keyIngredients.some((i) => i.toLowerCase().includes(q)),
      )
    }

    if (activeCuisineFilter) {
      filtered = filtered.filter((r) => r.cuisine === activeCuisineFilter)
    }

    if (activeMealTypeFilter) {
      filtered = filtered.filter((r) => r.mealTypes.includes(activeMealTypeFilter))
    }

    if (activeDietaryFilters.length > 0) {
      filtered = filtered.filter((r) => passesDietary(r, activeDietaryFilters))
    }

    return filtered
  },

  getRecipeById: (id) => get().recipes.find((r) => r.id === id),

  getSpinCandidates: (mealType, options = {}) => {
    const { recipes } = get()
    const { maxTimeMinutes, dietaryFilters = [] } = options

    return recipes.filter(
      (r) =>
        r.mealTypes.includes(mealType) &&
        (!maxTimeMinutes || r.totalTimeMinutes <= maxTimeMinutes) &&
        passesDietary(r, dietaryFilters),
    )
  },

  getMatchingRecipes: (cuisine, style, protein, mealType, options = {}) => {
    const spin = { cuisine, style, protein, mealType }

    // Base pool: meal type + strict filters (user's explicit constraints)
    const pool = get().getSpinCandidates(mealType, options)

    // Within each tier, rank by spin alignment (so 2-of-3 matches on cuisine+style
    // rank above 2-of-3 on style+protein, etc.), tiebreaking by quicker total time.
    const rank = (list: Recipe[]): Recipe[] =>
      [...list].sort((a, b) => {
        const diff = spinAlignment(b, spin) - spinAlignment(a, spin)
        if (diff !== 0) return diff
        return a.totalTimeMinutes - b.totalTimeMinutes
      })

    const exact = pool.filter(
      (r) => r.cuisine === cuisine && r.style === style && r.proteinBase === protein,
    )
    if (exact.length > 0) return rank(exact)

    const partial = pool.filter(
      (r) =>
        [r.cuisine === cuisine, r.style === style, r.proteinBase === protein].filter(Boolean)
          .length >= 2,
    )
    if (partial.length > 0) return rank(partial)

    const byCuisine = pool.filter((r) => r.cuisine === cuisine)
    if (byCuisine.length > 0) return rank(byCuisine)

    // Spin triple has zero relation to any filter-compliant recipe — return []
    // so the empty-state card renders with Clear-filters / reroll actions.
    return []
  },
}))
