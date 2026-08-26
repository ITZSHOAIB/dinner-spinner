import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ChefHat, Sparkles, Settings2, Trash2 } from 'lucide-react'
import { passesDietary, useRecipeStore } from '../stores/recipeStore'
import { usePantryStore } from '../stores/pantryStore'
import { bucketMatches } from '../lib/pantryMatch'
import {
  canonicalIngredients,
  ingredientById,
  quickAddIds,
  userFacingCategories,
} from '../data/ingredients'
import { IngredientInput } from '../components/pantry/IngredientInput'
import { StaplesPanel } from '../components/pantry/StaplesPanel'
import { PantryResultsSection, PantryRecipeCard } from '../components/pantry/PantryResults'
import { useSeo } from '../lib/useSeo'
import { cn } from '../lib/cn'

const dietaryFilterLabels: Record<string, string> = {
  'veg-only': 'Veg only',
  'egg-ok': 'Veg + egg',
  'non-veg': 'Non-veg',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  egg: 'Egg',
  'gluten-free': 'Gluten-free',
  'dairy-free': 'Dairy-free',
}

export function PantryPage() {
  useSeo({
    title: 'Pantry — Cook from what you have · Dinner Spinner',
    description:
      'Add the ingredients in your kitchen and discover which recipes you can cook tonight — or how close you are to making them.',
    path: '/pantry',
    noIndex: true, // user-state page, not for crawlers
  })

  const recipes = useRecipeStore((s) => s.recipes)
  const dietaryFilters = useRecipeStore((s) => s.activeDietaryFilters)
  const toggleDietaryFilter = useRecipeStore((s) => s.toggleDietaryFilter)
  const clearDietaryFilters = useRecipeStore((s) => s.clearDietaryFilters)

  const pantryIds = usePantryStore((s) => s.pantryIds)
  const excludedStapleIds = usePantryStore((s) => s.excludedStapleIds)
  const addIngredient = usePantryStore((s) => s.addIngredient)
  const removeIngredient = usePantryStore((s) => s.removeIngredient)
  const clearPantry = usePantryStore((s) => s.clear)

  const [staplesOpen, setStaplesOpen] = useState(false)

  // Apply dietary filters before scoring so the buckets only contain relevant recipes.
  const candidateRecipes = useMemo(() => {
    if (dietaryFilters.length === 0) return recipes
    return recipes.filter((r) => passesDietary(r, dietaryFilters))
  }, [recipes, dietaryFilters])

  const buckets = useMemo(
    () => bucketMatches(candidateRecipes, pantryIds, { excludedStapleIds }),
    [candidateRecipes, pantryIds, excludedStapleIds],
  )

  const hasPantry = pantryIds.length > 0
  const hasResults =
    buckets.cookable.length +
      buckets.oneAway.length +
      buckets.twoAway.length +
      buckets.threePlus.length >
    0
  const totalShown =
    buckets.cookable.length +
    buckets.oneAway.length +
    buckets.twoAway.length +
    buckets.threePlus.length
  const activeDietaryLabels = dietaryFilters.map(
    (filter) => dietaryFilterLabels[filter] ?? filter,
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
      {/* Hero header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-turmeric uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Pantry mode
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold text-text-primary leading-tight tracking-tight">
          What's in your{' '}
          <span className="font-display-italic text-gradient-warm">kitchen?</span>
        </h1>
        <p className="text-sm sm:text-base text-text-secondary mt-2 max-w-xl">
          Add what you have. We'll show recipes with all tracked key ingredients on hand,
          followed by dishes that need one, two, or three more.
        </p>
      </div>

      {/* Editor */}
      <div className="space-y-3 mb-6 sm:mb-8">
        <IngredientInput pantryIds={pantryIds} onAdd={addIngredient} />

        {/* Pantry chips row */}
        <AnimatePresence>
          {hasPantry && (
            <motion.div
              key="chips"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                  Your pantry · {pantryIds.length}
                </span>
                <button
                  type="button"
                  onClick={clearPantry}
                  className="inline-flex min-h-11 items-center gap-1 px-2 text-xs text-text-muted hover:text-chili transition-colors"
                  aria-label="Clear all pantry ingredients"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <AnimatePresence>
                  {pantryIds.map((id) => {
                    const ing = ingredientById.get(id)
                    if (!ing) return null
                    return (
                      <motion.button
                        key={id}
                        layout
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => removeIngredient(id)}
                        className="inline-flex min-h-11 items-center gap-1.5 pl-3 pr-2 rounded-full bg-turmeric/10 border border-turmeric/30 text-turmeric text-xs font-medium hover:bg-turmeric/20 transition-colors"
                        aria-label={`Remove ${ing.label} from pantry`}
                      >
                        {ing.emoji && <span className="text-sm leading-none">{ing.emoji}</span>}
                        <span>{ing.label}</span>
                        <span className="w-4 h-4 rounded-full bg-turmeric/20 flex items-center justify-center">
                          <X className="w-2.5 h-2.5" />
                        </span>
                      </motion.button>
                    )
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action row: staples + tally */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => setStaplesOpen(true)}
            className="inline-flex min-h-11 items-center gap-1.5 px-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
            aria-haspopup="dialog"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Staples
            {excludedStapleIds.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-chili/10 text-chili text-[10px] font-medium">
                −{excludedStapleIds.length}
              </span>
            )}
          </button>
          {hasPantry && (
            <span className="text-xs text-text-muted">
              {totalShown} recipes within reach
            </span>
          )}
        </div>
        {dietaryFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface-secondary/60 px-3 py-2">
            <span className="text-xs font-medium text-text-secondary">Recipe filters:</span>
            {dietaryFilters.map((filter, index) => (
              <button
                key={filter}
                type="button"
                onClick={() => toggleDietaryFilter(filter)}
                className="inline-flex min-h-9 items-center gap-1 rounded-full bg-turmeric/10 px-2.5 text-xs font-medium text-turmeric hover:bg-turmeric/20"
                aria-label={`Remove ${activeDietaryLabels[index]} recipe filter`}
              >
                {activeDietaryLabels[index]}
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearDietaryFilters}
              className="ml-auto inline-flex min-h-9 items-center px-2 text-xs font-medium text-text-muted hover:text-chili"
            >
              Clear filters
            </button>
          </div>
        )}
        <div className="sr-only" role="status" aria-live="polite">
          {hasPantry
            ? `${totalShown} recipes within three missing ingredients of your pantry`
            : 'Add ingredients to see matching recipes'}
        </div>
      </div>

      {/* Empty state — quick add */}
      {!hasPantry && <QuickAddGrid />}

      {/* Results */}
      {hasPantry && (
        <>
          <PantryResultsSection
            title="Ready to cook"
            subtitle="All tracked key ingredients on hand"
            matches={buckets.cookable}
            accent="green"
          />
          <PantryResultsSection
            title="One ingredient away"
            subtitle="Add one tracked ingredient, then check the full list"
            matches={buckets.oneAway}
            accent="amber"
          />
          <PantryResultsSection
            title="Two ingredients away"
            matches={buckets.twoAway}
            accent="muted"
            defaultCollapsed
          />
          <PantryResultsSection
            title="Three away"
            matches={buckets.threePlus}
            accent="muted"
            defaultCollapsed
          />

          {/* Closest fallback when nothing in primary buckets */}
          {!hasResults && buckets.closest.length > 0 && (
            <div className="mt-2">
              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-text-primary">
                  Closest to your pantry
                </h2>
                <span className="text-sm text-text-muted">
                  Add a couple more ingredients to unlock more
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {buckets.closest.map((m) => (
                  <PantryRecipeCard key={m.recipe.id} match={m} />
                ))}
              </div>
            </div>
          )}

          {/* True empty fallback */}
          {!hasResults && buckets.closest.length === 0 && buckets.threePlus.length === 0 && (
            <EmptyResults />
          )}
        </>
      )}

      <StaplesPanel open={staplesOpen} onClose={() => setStaplesOpen(false)} />
    </div>
  )
}

/* ──────────────────────────────────────────────────────────── */

function QuickAddGrid() {
  const pantryIds = usePantryStore((s) => s.pantryIds)
  const toggleIngredient = usePantryStore((s) => s.toggleIngredient)
  const inPantry = new Set(pantryIds)

  const tiles = quickAddIds
    .map((id) => ingredientById.get(id))
    .filter((x): x is NonNullable<typeof x> => Boolean(x))

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ChefHat className="w-4 h-4 text-turmeric" />
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
            Quick add
          </h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {tiles.map((ing) => {
            const active = inPantry.has(ing.id)
            return (
              <motion.button
                key={ing.id}
                layout
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleIngredient(ing.id)}
                aria-pressed={active}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-4 rounded-2xl border transition-all',
                  active
                    ? 'bg-turmeric/10 border-turmeric/40 shadow-sm'
                    : 'bg-surface-secondary border-border hover:border-turmeric/30 hover:shadow-sm',
                )}
              >
                <span className="text-3xl sm:text-4xl leading-none" aria-hidden>
                  {ing.emoji ?? '•'}
                </span>
                <span
                  className={cn(
                    'text-xs font-medium',
                    active ? 'text-turmeric' : 'text-text-primary',
                  )}
                >
                  {ing.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <BrowseByCategory />
    </div>
  )
}

function BrowseByCategory() {
  const pantryIds = usePantryStore((s) => s.pantryIds)
  const toggleIngredient = usePantryStore((s) => s.toggleIngredient)
  const inPantry = new Set(pantryIds)
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mb-3 inline-flex min-h-11 items-center px-1 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        aria-expanded={expanded}
        aria-controls="all-pantry-ingredients"
      >
        {expanded ? '− Hide all ingredients' : '+ Browse all ingredients'}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            id="all-pantry-ingredients"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden space-y-5"
          >
            {userFacingCategories.map((cat) => {
              const items = canonicalIngredients.filter(
                (i) => i.category === cat.id,
              )
              if (items.length === 0) return null
              return (
                <div key={cat.id}>
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
                    {cat.label}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((ing) => {
                      const active = inPantry.has(ing.id)
                      return (
                        <button
                          key={ing.id}
                          type="button"
                          onClick={() => toggleIngredient(ing.id)}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium transition-colors',
                            active
                              ? 'bg-turmeric/10 border-turmeric/40 text-turmeric'
                              : 'bg-surface-secondary border-border text-text-secondary hover:border-turmeric/30',
                          )}
                          aria-pressed={active}
                        >
                          {ing.emoji && <span className="text-sm leading-none">{ing.emoji}</span>}
                          <span>{ing.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EmptyResults() {
  return (
    <div className="text-center py-16">
      <p className="font-heading text-xl font-bold text-text-primary mb-1">
        No matching recipes yet.
      </p>
      <p className="text-sm text-text-muted max-w-sm mx-auto">
        Try adding another main ingredient or search for something else in your pantry.
      </p>
    </div>
  )
}
