import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowLeft, Clock, Flame, Heart, ChefHat,
  Users, ExternalLink, Check,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { useRecipeStore } from '../../stores/recipeStore'
import { useUserStore } from '../../stores/userStore'
import type { Recipe } from '../../data/types'

const spiceDots = (level: number) =>
  Array.from({ length: 5 }, (_, i) => (
    <Flame
      key={i}
      className={cn('w-4 h-4', i < level ? 'text-chili fill-chili' : 'text-border')}
    />
  ))

function dietaryBadges(recipe: Recipe) {
  const badges: { label: string; color: string }[] = []
  if (recipe.dietary.isVegan) badges.push({ label: 'Vegan', color: 'bg-coriander/10 text-coriander border-coriander/20' })
  if (recipe.dietary.isVegetarian) badges.push({ label: 'Vegetarian', color: 'bg-coriander/10 text-coriander border-coriander/20' })
  if (recipe.dietary.isNonVeg) badges.push({ label: 'Non-Veg', color: 'bg-chili/10 text-chili border-chili/20' })
  if (recipe.dietary.isEgg) badges.push({ label: 'Egg', color: 'bg-turmeric-light/10 text-turmeric border-turmeric/20' })
  if (recipe.dietary.isGlutenFree) badges.push({ label: 'Gluten-Free', color: 'bg-surface-tertiary text-text-secondary border-border' })
  if (recipe.dietary.isDairyFree) badges.push({ label: 'Dairy-Free', color: 'bg-surface-tertiary text-text-secondary border-border' })
  return badges
}

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const recipe = useRecipeStore((s) => s.getRecipeById)(id || '')
  const { isFavorite, toggleFavorite, markCooked, cookedHistory } = useUserStore()

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-text-muted">Recipe not found</p>
        <button
          onClick={() => navigate('/')}
          className="text-turmeric hover:underline"
        >
          Back to spinner
        </button>
      </div>
    )
  }

  const fav = isFavorite(recipe.id)
  const wasCooked = cookedHistory.some((h) => h.recipeId === recipe.id)
  const badges = dietaryBadges(recipe)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-4 py-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-surface-secondary transition-colors text-text-secondary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary truncate">
            {recipe.name}
          </h1>
          {recipe.nameLocal && (
            <p className="text-sm text-text-muted">{recipe.nameLocal}</p>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="flex flex-col items-center p-3 rounded-xl bg-surface-secondary">
          <Clock className="w-4 h-4 text-turmeric mb-1" />
          <span className="text-sm font-medium text-text-primary">{recipe.totalTimeMinutes}m</span>
          <span className="text-[10px] text-text-muted">Total</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl bg-surface-secondary">
          <ChefHat className="w-4 h-4 text-turmeric mb-1" />
          <span className="text-sm font-medium text-text-primary capitalize">{recipe.difficulty}</span>
          <span className="text-[10px] text-text-muted">Difficulty</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl bg-surface-secondary">
          <Users className="w-4 h-4 text-turmeric mb-1" />
          <span className="text-sm font-medium text-text-primary">{recipe.servings}</span>
          <span className="text-[10px] text-text-muted">Servings</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl bg-surface-secondary">
          <div className="flex gap-0.5 mb-1">{spiceDots(recipe.spiceLevel)}</div>
          <span className="text-[10px] text-text-muted">Spice</span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        {badges.map((b) => (
          <span key={b.label} className={cn('text-xs font-medium px-3 py-1 rounded-full border', b.color)}>
            {b.label}
          </span>
        ))}
        <span className="text-xs font-medium px-3 py-1 rounded-full bg-surface-tertiary text-text-secondary border border-border">
          {recipe.cuisine}
        </span>
        {recipe.region && (
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-surface-tertiary text-text-secondary border border-border">
            {recipe.region}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-text-secondary mb-6 leading-relaxed">{recipe.description}</p>

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => toggleFavorite(recipe.id)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all',
            fav
              ? 'bg-chili/10 text-chili border border-chili/30'
              : 'bg-surface-secondary text-text-secondary border border-border hover:border-chili/30',
          )}
        >
          <Heart className={cn('w-5 h-5', fav && 'fill-chili')} />
          {fav ? 'Favorited' : 'Favorite'}
        </button>
        <button
          onClick={() => markCooked(recipe.id)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all',
            wasCooked
              ? 'bg-coriander/10 text-coriander border border-coriander/30'
              : 'bg-surface-secondary text-text-secondary border border-border hover:border-coriander/30',
          )}
        >
          <Check className="w-5 h-5" />
          {wasCooked ? 'Cooked!' : 'Cooked It'}
        </button>
      </div>

      {/* Key ingredients */}
      <section className="mb-6">
        <h2 className="font-heading text-lg font-bold text-text-primary mb-3">Key Ingredients</h2>
        <div className="flex flex-wrap gap-2">
          {recipe.keyIngredients.map((ing) => (
            <span key={ing} className="px-3 py-1.5 rounded-lg bg-turmeric/10 text-turmeric text-sm font-medium">
              {ing}
            </span>
          ))}
        </div>
      </section>

      {/* Ingredients */}
      <section className="mb-6">
        <h2 className="font-heading text-lg font-bold text-text-primary mb-3">Ingredients</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-turmeric mt-1.5 flex-shrink-0" />
              {ing}
            </li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section className="mb-6">
        <h2 className="font-heading text-lg font-bold text-text-primary mb-3">Steps</h2>
        <ol className="space-y-4">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-turmeric/10 text-turmeric text-sm font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-sm text-text-secondary pt-1 leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Tips */}
      {recipe.tips && recipe.tips.length > 0 && (
        <section className="mb-6 p-4 rounded-xl bg-turmeric/5 border border-turmeric/20">
          <h2 className="font-heading text-lg font-bold text-turmeric mb-2">Tips</h2>
          <ul className="space-y-1">
            {recipe.tips.map((tip, i) => (
              <li key={i} className="text-sm text-text-secondary">• {tip}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Links */}
      {(recipe.youtubeUrl || recipe.articleUrl) && (
        <section className="mb-8 flex gap-3">
          {recipe.youtubeUrl && (
            <a
              href={recipe.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 font-medium border border-red-500/20 hover:bg-red-500/20 transition-colors no-underline"
            >
              <ExternalLink className="w-5 h-5" />
              Watch Video
            </a>
          )}
          {recipe.articleUrl && (
            <a
              href={recipe.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-secondary text-text-secondary font-medium border border-border hover:border-turmeric/30 transition-colors no-underline"
            >
              <ExternalLink className="w-5 h-5" />
              Read Recipe
            </a>
          )}
        </section>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 pb-8">
        {recipe.tags.map((tag) => (
          <span key={tag} className="text-[10px] text-text-muted px-2 py-0.5 rounded bg-surface-secondary">
            #{tag}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
