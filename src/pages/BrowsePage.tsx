import { useState, useMemo } from 'react'
import { AnimatePresence } from 'motion/react'
import { Search, X } from 'lucide-react'
import { useRecipeStore } from '../stores/recipeStore'
import { RecipeCard } from '../components/recipe/RecipeCard'
import { cn } from '../lib/cn'
import { useSeo } from '../lib/useSeo'
import type { MealType } from '../data/types'

const dietaryFilters = [
  { key: 'vegetarian', label: 'Veg' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'non-veg', label: 'Non-Veg' },
  { key: 'egg', label: 'Egg' },
  { key: 'gluten-free', label: 'GF' },
]

const mealTypeFilters: { key: MealType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snacks', label: 'Snacks' },
]

export function BrowsePage() {
  useSeo({
    title: 'Browse Recipes — Dinner Spinner',
    description:
      'Browse 150+ recipes across Bengali, Indian, Chinese, Asian, Continental, Mexican and Mediterranean cuisines. Filter by dietary needs, cuisine, and meal type.',
    path: '/recipes',
  })

  const {
    searchQuery, setSearchQuery,
    activeDietaryFilters, toggleDietaryFilter,
    activeMealTypeFilter, setMealTypeFilter,
    getFilteredRecipes,
  } = useRecipeStore()

  const recipes = useRecipeStore((s) => s.recipes)
  const filtered = getFilteredRecipes()

  const cuisines = useMemo(
    () => [...new Set(recipes.map((r) => r.cuisine))].sort(),
    [recipes],
  )
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null)

  const displayRecipes = useMemo(() => {
    if (!cuisineFilter) return filtered
    return filtered.filter((r) => r.cuisine === cuisineFilter)
  }, [filtered, cuisineFilter])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary mb-6">
        Browse Recipes
      </h1>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search recipes, ingredients, cuisines..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-xl bg-surface-secondary border border-border focus:border-turmeric/50 focus:outline-none text-sm text-text-primary placeholder:text-text-muted"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-tertiary rounded"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        )}
      </div>

      {/* Meal type tabs */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide">
        {mealTypeFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setMealTypeFilter(f.key === 'all' ? null : f.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
              (f.key === 'all' && !activeMealTypeFilter) || activeMealTypeFilter === f.key
                ? 'bg-turmeric text-white'
                : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Dietary filters */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide">
        {dietaryFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => toggleDietaryFilter(f.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
              activeDietaryFilters.includes(f.key)
                ? 'bg-coriander/10 text-coriander border border-coriander/30'
                : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary border border-transparent',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Cuisine filters */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setCuisineFilter(null)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
            !cuisineFilter
              ? 'bg-turmeric/10 text-turmeric border border-turmeric/30'
              : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary border border-transparent',
          )}
        >
          All Cuisines
        </button>
        {cuisines.map((c) => (
          <button
            key={c}
            onClick={() => setCuisineFilter(cuisineFilter === c ? null : c)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
              cuisineFilter === c
                ? 'bg-turmeric/10 text-turmeric border border-turmeric/30'
                : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary border border-transparent',
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-text-muted mb-4">
        {displayRecipes.length} recipe{displayRecipes.length !== 1 ? 's' : ''} found
      </p>

      {/* Recipe grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {displayRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </AnimatePresence>
      </div>

      {displayRecipes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted text-lg mb-2">No recipes found</p>
          <p className="text-text-muted text-sm">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  )
}
