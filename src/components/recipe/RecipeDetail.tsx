import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowLeft, Clock, Flame, Heart, ChefHat,
  Users, Check, Play, BookOpen, Search, ChevronRight,
  Sparkles, ExternalLink,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { useRecipeStore } from '../../stores/recipeStore'
import { useUserStore } from '../../stores/userStore'
import { resourcesFor } from '../../lib/recipeLinks'
import { rankBySimilarity, similarityScore } from '../../lib/similarity'
import { useSeo } from '../../lib/useSeo'
import type { Recipe } from '../../data/types'

// Minutes → ISO-8601 duration (PT20M, PT1H30M) for schema.org Recipe.
function isoDuration(mins: number): string {
  if (mins <= 0) return 'PT0M'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}`
}

function recipeSchema(r: Recipe) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: r.name,
    description: r.description,
    recipeCuisine: r.cuisine,
    recipeCategory: r.mealTypes.join(', '),
    keywords: r.tags.join(', '),
    prepTime: isoDuration(r.prepTimeMinutes),
    cookTime: isoDuration(r.cookTimeMinutes),
    totalTime: isoDuration(r.totalTimeMinutes),
    recipeYield: `${r.servings} servings`,
    recipeIngredient: r.ingredients,
    recipeInstructions: r.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: step,
    })),
    suitableForDiet: [
      r.dietary.isVegetarian ? 'https://schema.org/VegetarianDiet' : null,
      r.dietary.isVegan ? 'https://schema.org/VeganDiet' : null,
      r.dietary.isGlutenFree ? 'https://schema.org/GlutenFreeDiet' : null,
    ].filter(Boolean),
  }
}

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

  // Per-page SEO. Called unconditionally with fallback values so hook order
  // stays stable even on the "not found" branch.
  useSeo({
    title: recipe
      ? `${recipe.name} — ${recipe.cuisine} ${recipe.mealTypes[0]} recipe`
      : 'Recipe not found — Dinner Spinner',
    description: recipe
      ? `${recipe.description} Ready in ${recipe.totalTimeMinutes} minutes · ${recipe.difficulty} · serves ${recipe.servings}.`
      : 'The recipe you’re looking for could not be found.',
    path: recipe ? `/recipes/${recipe.id}` : undefined,
    type: recipe ? 'article' : 'website',
    noIndex: !recipe,
    jsonLd: recipe ? recipeSchema(recipe) : null,
  })

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
  const resources = resourcesFor(recipe)

  const allRecipes = useRecipeStore((s) => s.recipes)

  // Similar dishes: rank everything by similarity to this recipe. Prefer
  // same-cuisine matches, but surface a cross-cuisine dish when the score is
  // genuinely high (shared tags, similar time/spice). Threshold 0.35 keeps
  // out obvious mismatches.
  const sameCuisine = allRecipes.filter((r) => r.cuisine === recipe.cuisine)
  const crossCuisine = allRecipes
    .filter((r) => r.cuisine !== recipe.cuisine && similarityScore(recipe, r) >= 0.35)
  const similar = rankBySimilarity(recipe, [...sameCuisine, ...crossCuisine], 4)

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
          <h1 className="font-display-italic text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.05] text-text-primary truncate">
            {recipe.name}
          </h1>
          {recipe.nameLocal && (
            <p className="text-sm text-text-muted mt-1">{recipe.nameLocal}</p>
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

      {/* Resources */}
      <section className="mb-8">
        <h2 className="font-heading text-lg font-bold text-text-primary mb-3">Resources</h2>
        <ul className="rounded-xl bg-surface-secondary border border-border divide-y divide-border-subtle overflow-hidden">
          <ResourceRow
            href={resources.youtube.url}
            iconBg="bg-red-500/10"
            iconColor="text-red-500"
            icon={<Play className="w-4 h-4" />}
            title={resources.youtube.curated ? 'Watch the tutorial' : 'Video tutorials on YouTube'}
            subtitle={resources.youtube.curated ? 'Curated walkthrough' : 'YouTube search for this dish'}
            hostLabel="youtube.com"
            external
          />
          <ResourceRow
            href={resources.article.url}
            iconBg="bg-turmeric/10"
            iconColor="text-turmeric"
            icon={<BookOpen className="w-4 h-4" />}
            title={resources.article.curated ? 'Read the full recipe' : 'Written recipe articles'}
            subtitle={resources.article.curated ? 'Curated article' : 'Google search for written recipes'}
            hostLabel={resources.article.curated ? hostOf(resources.article.url) : 'google.com'}
            external
          />
          <ResourceRow
            href={resources.moreVariations.url}
            iconBg="bg-coriander/10"
            iconColor="text-coriander"
            icon={<Search className="w-4 h-4" />}
            title="Explore variations"
            subtitle={`Regional twists on ${recipe.name}`}
            hostLabel="google.com"
            external
          />
        </ul>
      </section>

      {/* Similar dishes */}
      {similar.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-turmeric" />
            <h2 className="font-heading text-lg font-bold text-text-primary">You might also like</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {similar.map((r) => {
              const sameCuisine = r.cuisine === recipe.cuisine
              return (
                <Link
                  key={r.id}
                  to={`/recipes/${r.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary border border-border hover:border-turmeric/30 transition-colors no-underline group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{r.name}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {sameCuisine ? r.style : r.cuisine} · {r.totalTimeMinutes} min · {r.difficulty}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-turmeric group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                </Link>
              )
            })}
          </div>
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

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

interface ResourceRowProps {
  href: string
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  title: string
  subtitle: string
  hostLabel?: string
  external?: boolean
}

function ResourceRow({ href, icon, iconBg, iconColor, title, subtitle, hostLabel, external }: ResourceRowProps) {
  return (
    <li>
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="flex items-center gap-3 px-3 py-3 hover:bg-surface-tertiary transition-colors no-underline group"
      >
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            iconBg,
            iconColor,
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary leading-tight truncate">{title}</p>
          <p className="text-[11px] text-text-muted mt-0.5 leading-tight flex items-center gap-1">
            <span className="truncate">{subtitle}</span>
            {hostLabel && (
              <>
                <span className="text-border">·</span>
                <span className="truncate">{hostLabel}</span>
              </>
            )}
          </p>
        </div>
        {external ? (
          <ExternalLink className="w-3.5 h-3.5 text-text-muted group-hover:text-text-secondary transition-colors flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors flex-shrink-0" />
        )}
      </a>
    </li>
  )
}
