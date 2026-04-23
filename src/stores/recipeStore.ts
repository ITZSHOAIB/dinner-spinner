import { create } from 'zustand'
import type { MealType, Recipe } from '../data/types'
import { spinAlignment } from '../lib/similarity'

export interface MatchOptions {
  maxTimeMinutes?: number
  dietaryFilters?: string[]
}

interface RecipeState {
  recipes: Recipe[]
  setRecipes: (recipes: Recipe[]) => void

  // Search & filters
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeDietaryFilters: string[]
  toggleDietaryFilter: (filter: string) => void
  activeCuisineFilter: string | null
  setCuisineFilter: (cuisine: string | null) => void
  activeMealTypeFilter: MealType | null
  setMealTypeFilter: (type: MealType | null) => void

  // Derived
  getFilteredRecipes: () => Recipe[]
  getRecipeById: (id: string) => Recipe | undefined
  getMatchingRecipes: (
    cuisine: string,
    style: string,
    protein: string,
    mealType: MealType,
    options?: MatchOptions,
  ) => Recipe[]
}

function passesDietary(r: Recipe, filters: string[]): boolean {
  for (const f of filters) {
    switch (f) {
      case 'vegetarian': if (!r.dietary.isVegetarian) return false; break
      case 'vegan': if (!r.dietary.isVegan) return false; break
      case 'non-veg': if (!r.dietary.isNonVeg) return false; break
      case 'egg': if (!r.dietary.isEgg) return false; break
      case 'gluten-free': if (!r.dietary.isGlutenFree) return false; break
      case 'dairy-free': if (!r.dietary.isDairyFree) return false; break
    }
  }
  return true
}

export const useRecipeStore = create<RecipeState>()((set, get) => ({
  recipes: [],
  setRecipes: (recipes) => set({ recipes }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  activeDietaryFilters: [],
  toggleDietaryFilter: (filter) =>
    set((state) => ({
      activeDietaryFilters: state.activeDietaryFilters.includes(filter)
        ? state.activeDietaryFilters.filter((f) => f !== filter)
        : [...state.activeDietaryFilters, filter],
    })),

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
      filtered = filtered.filter((r) => {
        return activeDietaryFilters.every((filter) => {
          switch (filter) {
            case 'vegetarian': return r.dietary.isVegetarian
            case 'vegan': return r.dietary.isVegan
            case 'non-veg': return r.dietary.isNonVeg
            case 'egg': return r.dietary.isEgg
            case 'gluten-free': return r.dietary.isGlutenFree
            case 'dairy-free': return r.dietary.isDairyFree
            default: return true
          }
        })
      })
    }

    return filtered
  },

  getRecipeById: (id) => get().recipes.find((r) => r.id === id),

  getMatchingRecipes: (cuisine, style, protein, mealType, options = {}) => {
    const { recipes } = get()
    const { maxTimeMinutes, dietaryFilters = [] } = options
    const spin = { cuisine, style, protein, mealType }

    // Base pool: meal type + strict filters (user's explicit constraints)
    const pool = recipes.filter(
      (r) =>
        r.mealTypes.includes(mealType) &&
        (!maxTimeMinutes || r.totalTimeMinutes <= maxTimeMinutes) &&
        passesDietary(r, dietaryFilters),
    )

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
