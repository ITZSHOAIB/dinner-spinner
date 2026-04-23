import { Link } from 'react-router-dom'
import { Clock, Flame, Heart } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '../../lib/cn'
import { useUserStore } from '../../stores/userStore'
import type { Recipe } from '../../data/types'

interface RecipeCardProps {
  recipe: Recipe
}

const spiceDots = (level: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <Flame
      key={i}
      className={cn('w-3 h-3', i < level ? 'text-chili fill-chili' : 'text-border')}
    />
  ))

const dietaryBadge = (recipe: Recipe) => {
  if (recipe.dietary.isVegan) return { label: 'Vegan', color: 'bg-coriander/10 text-coriander' }
  if (recipe.dietary.isVegetarian) return { label: 'Veg', color: 'bg-coriander/10 text-coriander' }
  if (recipe.dietary.isEgg) return { label: 'Egg', color: 'bg-turmeric-light/10 text-turmeric' }
  return { label: 'Non-Veg', color: 'bg-chili/10 text-chili' }
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { isFavorite, toggleFavorite } = useUserStore()
  const fav = isFavorite(recipe.id)
  const badge = dietaryBadge(recipe)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/recipes/${recipe.id}`}
        className="block p-4 rounded-xl bg-surface-secondary border border-border hover:border-turmeric/30 hover:shadow-lg transition-all duration-200 no-underline group"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-text-primary truncate group-hover:text-turmeric transition-colors">
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
            aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={cn(
                'w-5 h-5 transition-all',
                fav ? 'fill-chili text-chili scale-110' : 'text-text-muted hover:text-chili',
              )}
            />
          </button>
        </div>

        <p className="text-xs text-text-secondary line-clamp-2 mb-3">
          {recipe.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', badge.color)}>
            {badge.label}
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-tertiary text-text-secondary">
            {recipe.cuisine}
          </span>
          <div className="flex items-center gap-0.5 ml-auto">
            <Clock className="w-3 h-3 text-text-muted" />
            <span className="text-[10px] text-text-muted">{recipe.totalTimeMinutes}m</span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 mt-2">
          {spiceDots(recipe.spiceLevel)}
        </div>
      </Link>
    </motion.div>
  )
}
