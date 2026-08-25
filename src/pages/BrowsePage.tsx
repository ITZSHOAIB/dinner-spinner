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
const dietaryLabelMap = new Map(dietaryFilters.map((filter) => [filter.key, filter.label]))
const mealLabelMap = new Map(mealTypeFilters.map((filter) => [filter.key, filter.label]))

const sharedChipClasses =
  'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors'

function chipClasses(active: boolean, activeClassName: string) {
  return cn(
    sharedChipClasses,
    active
      ? activeClassName
      : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary border border-transparent',
  )
}

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
  const bases = useMemo(
    () => [...new Set(recipes.map((r) => r.proteinBase))].sort(),
    [recipes],
  )
  const dishes = useMemo(
    () => [...new Set(recipes.map((r) => r.style))].sort(),
    [recipes],
  )
  const [cuisineFilter, setCuisineFilter] = useState<string | null>(null)
  const [baseFilter, setBaseFilter] = useState<string | null>(null)
  const [dishFilter, setDishFilter] = useState<string | null>(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const advancedFiltersRef = useRef<HTMLDivElement>(null)

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
    const base = searchParams.get('base')
    const dish = searchParams.get('dish')

    setSearchQuery(q)

    const validMeal = meal && MEAL_TYPES.includes(meal as MealType) ? (meal as MealType) : null
    setMealTypeFilter(validMeal)

    const validDiet = diet
      ? diet.split(',').filter((d) => DIETARY_KEYS.has(d))
      : []
    useRecipeStore.setState({ activeDietaryFilters: normalizeDietaryFilters(validDiet) })

    setCuisineFilter(cuisine && cuisines.includes(cuisine) ? cuisine : null)
    setBaseFilter(base && bases.includes(base) ? base : null)
    setDishFilter(dish && dishes.includes(dish) ? dish : null)
  }, [searchParams, setSearchQuery, setMealTypeFilter, cuisines, bases, dishes])

  // Keep URL in sync when filters change (replace, not push, so back button skips intermediate states).
  useEffect(() => {
    if (!hydratedRef.current) return
    const next = new URLSearchParams()
    if (searchQuery) next.set('q', searchQuery)
    if (activeMealTypeFilter) next.set('meal', activeMealTypeFilter)
    if (activeDietaryFilters.length > 0) next.set('diet', activeDietaryFilters.join(','))
    if (cuisineFilter) next.set('cuisine', cuisineFilter)
    if (baseFilter) next.set('base', baseFilter)
    if (dishFilter) next.set('dish', dishFilter)
    setSearchParams(next, { replace: true })
  }, [
    searchQuery,
    activeMealTypeFilter,
    activeDietaryFilters,
    cuisineFilter,
    baseFilter,
    dishFilter,
    setSearchParams,
  ])

  const displayRecipes = useMemo(() => {
    return filtered.filter((r) => {
      if (cuisineFilter && r.cuisine !== cuisineFilter) return false
      if (baseFilter && r.proteinBase !== baseFilter) return false
      if (dishFilter && r.style !== dishFilter) return false
      return true
    })
  }, [filtered, cuisineFilter, baseFilter, dishFilter])

  const hasActiveFilters = Boolean(
    searchQuery ||
      activeMealTypeFilter ||
      cuisineFilter ||
      baseFilter ||
      dishFilter ||
      activeDietaryFilters.length > 0,
  )
  const hiddenFilterCount = activeDietaryFilters.length + (cuisineFilter ? 1 : 0) + (dishFilter ? 1 : 0)

  const clearFilters = () => {
    setSearchQuery('')
    setMealTypeFilter(null)
    setCuisineFilter(null)
    setBaseFilter(null)
    setDishFilter(null)
    setShowAdvancedFilters(false)
    useRecipeStore.setState({ activeDietaryFilters: [] })
  }

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (
        showAdvancedFilters &&
        advancedFiltersRef.current &&
        !advancedFiltersRef.current.contains(event.target as Node)
      ) {
        setShowAdvancedFilters(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowAdvancedFilters(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [showAdvancedFilters])

  const seoTitle = useMemo(() => {
    const segments: string[] = []
    if (searchQuery) segments.push(`Search: ${searchQuery}`)
    if (cuisineFilter) segments.push(`${cuisineFilter} recipes`)
    if (baseFilter) segments.push(`${baseFilter} base`)
    if (dishFilter) segments.push(`${dishFilter} dishes`)
    if (activeMealTypeFilter) {
      segments.push(`${activeMealTypeFilter[0].toUpperCase()}${activeMealTypeFilter.slice(1)} ideas`)
    }
    if (activeDietaryFilters.length > 0) segments.push(activeDietaryFilters.join(', '))

    return segments.length > 0
      ? `${segments.join(' | ')} — Dinner Spinner`
      : 'Browse Recipes — Dinner Spinner'
  }, [activeDietaryFilters, activeMealTypeFilter, baseFilter, cuisineFilter, dishFilter, searchQuery])

  const seoDescription = useMemo(() => {
    const qualifiers = [
      cuisineFilter,
      baseFilter,
      dishFilter,
      activeMealTypeFilter,
      activeDietaryFilters.length > 0 ? activeDietaryFilters.join(', ') : null,
      searchQuery ? `matching "${searchQuery}"` : null,
    ].filter(Boolean)

    if (qualifiers.length === 0) {
      return 'Browse recipes across Bengali, Indian, Chinese, Asian, Continental, Mexican and Mediterranean cuisines. Filter by dietary needs, cuisine, base, dish, and meal type.'
    }

    return `${displayRecipes.length} recipes ${qualifiers.join(', ')} on Dinner Spinner. Filter by cuisine, base, dish, meal type, ingredients, and dietary needs.`
  }, [activeDietaryFilters, activeMealTypeFilter, baseFilter, cuisineFilter, dishFilter, displayRecipes.length, searchQuery])

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

      <div className="space-y-3 mb-4">
        <div className="flex flex-wrap gap-1.5">
          {mealTypeFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={(f.key === 'all' && !activeMealTypeFilter) || activeMealTypeFilter === f.key}
              onClick={() => setMealTypeFilter(f.key === 'all' ? null : f.key)}
              className={cn(
                sharedChipClasses,
                (f.key === 'all' && !activeMealTypeFilter) || activeMealTypeFilter === f.key
                  ? 'bg-turmeric text-white'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="mr-1 self-center text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
            Base
          </span>
          {bases.map((base) => (
            <button
              key={base}
              type="button"
              aria-pressed={baseFilter === base}
              onClick={() => setBaseFilter(baseFilter === base ? null : base)}
              className={cn(
                sharedChipClasses,
                baseFilter === base
                  ? 'bg-coriander/10 text-coriander border border-coriander/30'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary border border-transparent',
              )}
            >
              {base}
            </button>
          ))}
        </div>
        <div className="relative" ref={advancedFiltersRef}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-expanded={showAdvancedFilters}
              aria-controls="browse-advanced-filters"
              onClick={() => setShowAdvancedFilters((value) => !value)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-secondary px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-tertiary"
            >
              <span>More filters</span>
              {hiddenFilterCount > 0 && <span className="text-text-muted">({hiddenFilterCount})</span>}
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showAdvancedFilters && 'rotate-180')} />
            </button>
          </div>
          {showAdvancedFilters && (
            <div
              id="browse-advanced-filters"
              className="absolute left-0 top-full z-20 mt-2 w-full max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border/70 bg-surface shadow-xl p-3 sm:w-[36rem]"
            >
              <div className="grid gap-4">
                <section>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                    Cuisine
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      aria-pressed={!cuisineFilter}
                      onClick={() => setCuisineFilter(null)}
                      className={chipClasses(!cuisineFilter, 'bg-turmeric/10 text-turmeric border border-turmeric/30')}
                    >
                      All cuisines
                    </button>
                    {cuisines.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-pressed={cuisineFilter === c}
                        onClick={() => setCuisineFilter(cuisineFilter === c ? null : c)}
                        className={chipClasses(cuisineFilter === c, 'bg-turmeric/10 text-turmeric border border-turmeric/30')}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </section>
                <div className="grid gap-4 sm:grid-cols-2">
                  <section>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                      Dietary
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {dietaryFilters.map((f) => (
                        <button
                          key={f.key}
                          type="button"
                          aria-pressed={activeDietaryFilters.includes(f.key)}
                          onClick={() => toggleDietaryFilter(f.key)}
                          className={cn(
                            sharedChipClasses,
                            activeDietaryFilters.includes(f.key)
                              ? 'bg-coriander/10 text-coriander border border-coriander/30'
                              : 'bg-surface-secondary text-text-secondary hover:bg-surface-tertiary border border-transparent',
                          )}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </section>
                  <section>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                      Dish
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        aria-pressed={!dishFilter}
                        onClick={() => setDishFilter(null)}
                        className={chipClasses(!dishFilter, 'bg-turmeric/10 text-turmeric border border-turmeric/30')}
                      >
                        Any dish
                      </button>
                      {dishes.map((dish) => (
                        <button
                          key={dish}
                          type="button"
                          aria-pressed={dishFilter === dish}
                          onClick={() => setDishFilter(dishFilter === dish ? null : dish)}
                          className={chipClasses(dishFilter === dish, 'bg-turmeric/10 text-turmeric border border-turmeric/30')}
                        >
                          {dish}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-border/60 bg-surface-secondary/15 px-3 py-2.5 sm:px-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
        {hasActiveFilters && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              Applied filters
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1 rounded-full border border-turmeric/30 bg-turmeric/10 px-2.5 py-1 text-[11px] font-medium text-turmeric"
              >
                Search: {searchQuery}
                <X className="h-3 w-3" />
              </button>
            )}
            {activeMealTypeFilter && (
              <button
                type="button"
                onClick={() => setMealTypeFilter(null)}
                className="inline-flex items-center gap-1 rounded-full border border-turmeric/30 bg-turmeric/10 px-2.5 py-1 text-[11px] font-medium text-turmeric"
              >
                Meal: {mealLabelMap.get(activeMealTypeFilter) ?? activeMealTypeFilter}
                <X className="h-3 w-3" />
              </button>
            )}
            {cuisineFilter && (
              <button
                type="button"
                onClick={() => setCuisineFilter(null)}
                className="inline-flex items-center gap-1 rounded-full border border-turmeric/30 bg-turmeric/10 px-2.5 py-1 text-[11px] font-medium text-turmeric"
              >
                Cuisine: {cuisineFilter}
                <X className="h-3 w-3" />
              </button>
            )}
            {baseFilter && (
              <button
                type="button"
                onClick={() => setBaseFilter(null)}
                className="inline-flex items-center gap-1 rounded-full border border-turmeric/30 bg-turmeric/10 px-2.5 py-1 text-[11px] font-medium text-turmeric"
              >
                Base: {baseFilter}
                <X className="h-3 w-3" />
              </button>
            )}
            {dishFilter && (
              <button
                type="button"
                onClick={() => setDishFilter(null)}
                className="inline-flex items-center gap-1 rounded-full border border-turmeric/30 bg-turmeric/10 px-2.5 py-1 text-[11px] font-medium text-turmeric"
              >
                Dish: {dishFilter}
                <X className="h-3 w-3" />
              </button>
            )}
            {activeDietaryFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => toggleDietaryFilter(filter)}
                className="inline-flex items-center gap-1 rounded-full border border-coriander/30 bg-coriander/10 px-2.5 py-1 text-[11px] font-medium text-coriander"
              >
                {dietaryLabelMap.get(filter) ?? filter}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
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
