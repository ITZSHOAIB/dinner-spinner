import { create } from 'zustand'
import type { MealType, Recipe } from '../data/types'

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
  getMatchingRecipes: (cuisine: string, style: string, protein: string, mealType: MealType) => Recipe[]
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

  getMatchingRecipes: (cuisine, style, protein, mealType) => {
    const { recipes } = get()
    // Exact matches first
    const exact = recipes.filter(
      (r) =>
        r.cuisine === cuisine &&
        r.style === style &&
        r.proteinBase === protein &&
        r.mealTypes.includes(mealType),
    )
    if (exact.length > 0) return exact

    // Partial matches (2 of 3 reel values)
    const partial = recipes.filter(
      (r) =>
        r.mealTypes.includes(mealType) &&
        [r.cuisine === cuisine, r.style === style, r.proteinBase === protein].filter(Boolean).length >= 2,
    )
    if (partial.length > 0) return partial

    // At least cuisine match
    return recipes.filter(
      (r) => r.cuisine === cuisine && r.mealTypes.includes(mealType),
    )
  },
}))
