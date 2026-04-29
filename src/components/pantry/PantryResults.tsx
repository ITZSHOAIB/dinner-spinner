import { Link } from 'react-router-dom'
import { Clock, Heart, Plus, ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import type { RecipeMatch } from '../../lib/pantryMatch'
import { ingredientById } from '../../data/ingredients'
import { useUserStore } from '../../stores/userStore'
import { usePantryStore } from '../../stores/pantryStore'
import { cn } from '../../lib/cn'

function MissingChips({ ids }: { ids: string[] }) {
  const addIngredient = usePantryStore((s) => s.addIngredient)
  if (ids.length === 0) return null
  return (
    <div className="flex items-center flex-wrap gap-1 mt-2">
      <span className="text-[10px] text-text-muted font-medium uppercase tracking-wide">
        Missing
      </span>
      {ids.map((id) => {
        const ing = ingredientById.get(id)
        const label = ing?.label ?? id
        return (
          <button
            key={id}
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              addIngredient(id)
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-chili/10 text-chili border border-chili/20 text-[10px] font-medium hover:bg-chili/20 transition-colors group/chip"
            title={`Add ${label} to pantry`}
          >
            {ing?.emoji && <span className="text-[11px] leading-none">{ing.emoji}</span>}
            <span>{label}</span>
            <Plus className="w-2.5 h-2.5 opacity-0 group-hover/chip:opacity-100 transition-opacity" />
          </button>
        )
      })}
    </div>
  )
}

interface CardProps {
  match: RecipeMatch
}

export function PantryRecipeCard({ match }: CardProps) {
  const { recipe, missing, have, required } = match
  const isFav = useUserStore((s) => s.isFavorite(recipe.id))
  const toggleFavorite = useUserStore((s) => s.toggleFavorite)

  const cookable = missing.length === 0 && required.length > 0
  const ratio = required.length > 0 ? have.length / required.length : 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/recipes/${recipe.id}`}
        className={cn(
          'block p-4 rounded-2xl border bg-surface-secondary hover:shadow-lg transition-all duration-200 no-underline group',
          cookable
            ? 'border-coriander/40 hover:border-coriander/60 shadow-coriander/5'
            : 'border-border hover:border-turmeric/30',
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                'font-medium text-text-primary truncate transition-colors',
                cookable ? 'group-hover:text-coriander' : 'group-hover:text-turmeric',
              )}
            >
              {recipe.name}
            </h3>
            {recipe.nameLocal && (
              <p className="text-xs text-text-muted truncate">{recipe.nameLocal}</p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleFavorite(recipe.id)
            }}
            className="p-1 -m-1 flex-shrink-0"
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={cn(
                'w-5 h-5 transition-all',
                isFav ? 'fill-chili text-chili scale-110' : 'text-text-muted hover:text-chili',
              )}
            />
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
          <span>{recipe.cuisine}</span>
          <span className="text-text-muted">·</span>
          <Clock className="w-3 h-3 text-text-muted" />
          <span>{recipe.totalTimeMinutes}m</span>
        </div>

        {/* Match progress bar */}
        {required.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wide">
                {have.length}/{required.length} key ingredients
              </span>
            </div>
            <div className="h-1 bg-surface-tertiary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${ratio * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full',
                  cookable ? 'bg-coriander' : 'bg-turmeric',
                )}
              />
            </div>
          </div>
        )}

        <MissingChips ids={missing} />
      </Link>
    </motion.div>
  )
}

interface SectionProps {
  title: string
  subtitle?: string
  matches: RecipeMatch[]
  accent?: 'green' | 'amber' | 'muted'
  defaultCollapsed?: boolean
}

export function PantryResultsSection({
  title,
  subtitle,
  matches,
  accent = 'muted',
  defaultCollapsed = false,
}: SectionProps) {
  // Use a state-less approach via <details> for collapsing — keeps it simple
  // and natively accessible without state plumbing.
  if (matches.length === 0) return null

  const dotColor =
    accent === 'green' ? 'bg-coriander' : accent === 'amber' ? 'bg-turmeric' : 'bg-text-muted'

  return (
    <details className="group/section mb-8" open={!defaultCollapsed}>
      <summary
        className="flex items-center gap-3 mb-4 px-3 py-2.5 -mx-3 rounded-xl cursor-pointer list-none select-none hover:bg-surface-tertiary/60 transition-colors [&::-webkit-details-marker]:hidden"
        aria-label={`${title}, ${matches.length} recipes — click to toggle`}
      >
        <span className={cn('w-2 h-2 rounded-full flex-shrink-0', dotColor)} />
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-text-primary">
          {title}
        </h2>
        <span
          className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            accent === 'green'
              ? 'bg-coriander/15 text-coriander'
              : accent === 'amber'
                ? 'bg-turmeric/15 text-turmeric'
                : 'bg-surface-tertiary text-text-secondary',
          )}
        >
          {matches.length}
        </span>
        {subtitle && (
          <span className="text-xs text-text-muted hidden md:inline">
            · {subtitle}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-text-muted group-hover/section:text-text-primary">
          <span className="group-open/section:hidden">Show</span>
          <span className="hidden group-open/section:inline">Hide</span>
          <ChevronDown
            className="w-4 h-4 transition-transform duration-200 group-open/section:rotate-180"
            aria-hidden="true"
          />
        </span>
      </summary>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {matches.map((m) => (
          <PantryRecipeCard key={m.recipe.id} match={m} />
        ))}
      </div>
    </details>
  )
}
