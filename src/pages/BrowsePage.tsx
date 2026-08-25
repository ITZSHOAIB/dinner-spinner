import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { ChevronDown, Search, X } from 'lucide-react'
import { normalizeDietaryFilters, useRecipeStore } from '../stores/recipeStore'
import { RecipeCard } from '../components/recipe/RecipeCard'
import { cn } from '../lib/cn'
import { browseJsonLd, normalizeSiteUrl } from '../lib/seo'
import { useSeo } from '../lib/useSeo'
import type { MealType } from '../data/types'

const dietaryFilters = [
  { key: 'veg-only', label: 'Veg only' },
  { key: 'egg-ok', label: 'Veg + egg' },
  { key: 'non-veg', label: 'Non-Veg' },
  { key: 'gluten-free', label: 'GF' },
  { key: 'dairy-free', label: 'DF' },
]
const DIETARY_KEYS = new Set(dietaryFilters.map((f) => f.key))

const mealTypeFilters: { key: MealType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snacks', label: 'Snacks' },
]
const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks']
const SITE_URL = normalizeSiteUrl(import.meta.env.VITE_SITE_URL)

export function BrowsePage() {
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
  const [showAllCuisines, setShowAllCuisines] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()
  const hydratedRef = useRef(false)

  // Hydrate filters from URL once on mount (URL wins over persisted store state).
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true

    const q = searchParams.get('q') ?? ''
    const meal = searchParams.get('meal')
    const diet = searchParams.get('diet')
    const cuisine = searchParams.get('cuisine')

    setSearchQuery(q)

    const validMeal = meal && MEAL_TYPES.includes(meal as MealType) ? (meal as MealType) : null
    setMealTypeFilter(validMeal)

    const validDiet = diet
      ? diet.split(',').filter((d) => DIETARY_KEYS.has(d))
      : []
    useRecipeStore.setState({ activeDietaryFilters: normalizeDietaryFilters(validDiet) })

    setCuisineFilter(cuisine && cuisines.includes(cuisine) ? cuisine : null)
  }, [searchParams, setSearchQuery, setMealTypeFilter, cuisines])

  // Keep URL in sync when filters change (replace, not push, so back button skips intermediate states).
  useEffect(() => {
    if (!hydratedRef.current) return
    const next = new URLSearchParams()
    if (searchQuery) next.set('q', searchQuery)
    if (activeMealTypeFilter) next.set('meal', activeMealTypeFilter)
    if (activeDietaryFilters.length > 0) next.set('diet', activeDietaryFilters.join(','))
    if (cuisineFilter) next.set('cuisine', cuisineFilter)
    setSearchParams(next, { replace: true })
  }, [searchQuery, activeMealTypeFilter, activeDietaryFilters, cuisineFilter, setSearchParams])

  const displayRecipes = useMemo(() => {
    if (!cuisineFilter) return filtered
    return filtered.filter((r) => r.cuisine === cuisineFilter)
  }, [filtered, cuisineFilter])

  const hasActiveFilters = Boolean(
    searchQuery || activeMealTypeFilter || cuisineFilter || activeDietaryFilters.length > 0,
  )
  const visibleCuisines = showAllCuisines ? cuisines : cuisines.slice(0, 8)

  const clearFilters = () => {
    setSearchQuery('')
    setMealTypeFilter(null)
    setCuisineFilter(null)
    useRecipeStore.setState({ activeDietaryFilters: [] })
  }

  const seoTitle = useMemo(() => {
    const segments: string[] = []
    if (searchQuery) segments.push(`Search: ${searchQuery}`)
    if (cuisineFilter) segments.push(`${cuisineFilter} recipes`)
    if (activeMealTypeFilter) {
      segments.push(`${activeMealTypeFilter[0].toUpperCase()}${activeMealTypeFilter.slice(1)} ideas`)
    }
    if (activeDietaryFilters.length > 0) segments.push(activeDietaryFilters.join(', '))

    return segments.length > 0
      ? `${segments.join(' | ')} — Dinner Spinner`
      : 'Browse Recipes — Dinner Spinner'
  }, [activeDietaryFilters, activeMealTypeFilter, cuisineFilter, searchQuery])

  const seoDescription = useMemo(() => {
    const qualifiers = [
      cuisineFilter,
      activeMealTypeFilter,
      activeDietaryFilters.length > 0 ? activeDietaryFilters.join(', ') : null,
      searchQuery ? `matching "${searchQuery}"` : null,
    ].filter(Boolean)

    if (qualifiers.length === 0) {
      return 'Browse 150+ recipes across Bengali, Indian, Chinese, Asian, Continental, Mexican and Mediterranean cuisines. Filter by dietary needs, cuisine, and meal type.'
    }

    return `${displayRecipes.length} recipes ${qualifiers.join(', ')} on Dinner Spinner. Filter by cuisine, meal type, ingredients, and dietary needs.`
  }, [activeDietaryFilters, activeMealTypeFilter, cuisineFilter, displayRecipes.length, searchQuery])

  useSeo({
    title: seoTitle,
    description: seoDescription,
    path: '/recipes/',
    jsonLd: browseJsonLd(SITE_URL, recipes),
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary mb-6">
        Browse Recipes
      </h1>

      {/* Search */}
      <div className="relative mb-4">
        <label htmlFor="browse-search" className="sr-only">
          Search recipes, ingredients, or cuisines
        </label>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          id="browse-search"
          type="text"
          placeholder="Search recipes, ingredients, cuisines..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-xl bg-surface-secondary border border-border focus:border-turmeric/50 focus:outline-none text-sm text-text-primary placeholder:text-text-muted"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-tertiary rounded"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        )}
      </div>

      {/* Meal type tabs */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {mealTypeFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={(f.key === 'all' && !activeMealTypeFilter) || activeMealTypeFilter === f.key}
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
      <div className="flex flex-wrap gap-1.5 mb-3">
        {dietaryFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={activeDietaryFilters.includes(f.key)}
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
      <div className="mb-6">
        <div className="flex flex-wrap gap-1.5" id="cuisine-filters">
          <button
            type="button"
            aria-pressed={!cuisineFilter}
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
          {visibleCuisines.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cuisineFilter === c}
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
        {cuisines.length > visibleCuisines.length && (
          <button
            type="button"
            aria-expanded={showAllCuisines}
            aria-controls="cuisine-filters"
            onClick={() => setShowAllCuisines((value) => !value)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-turmeric hover:text-turmeric/80"
          >
            {showAllCuisines ? 'Fewer cuisines' : `More cuisines (${cuisines.length - visibleCuisines.length})`}
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showAllCuisines && 'rotate-180')} />
          </button>
        )}
      </div>

      {/* Results count and active-filter reset */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-xs text-text-muted">
          {displayRecipes.length} recipe{displayRecipes.length !== 1 ? 's' : ''} found
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-turmeric hover:text-turmeric/80"
          >
            <X className="w-3.5 h-3.5" />
            Clear filters
          </button>
        )}
      </div>

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
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-turmeric px-4 py-2 text-sm font-medium text-white hover:bg-turmeric/90"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
