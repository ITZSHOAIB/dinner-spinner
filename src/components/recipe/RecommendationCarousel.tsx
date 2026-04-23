import { useMemo } from 'react'
import { useRecipeStore } from '../../stores/recipeStore'
import { useUserStore } from '../../stores/userStore'
import { useSpinnerStore } from '../../stores/spinnerStore'
import { RecipeCard } from './RecipeCard'
import type { Recipe } from '../../data/types'

function scoreRecipe(
  recipe: Recipe,
  favorites: string[],
  cookedHistory: { recipeId: string; date: string }[],
  cuisinePreferences: string[],
  spiceLevel: number,
): number {
  let score = 0

  // Cuisine preference match
  if (cuisinePreferences.includes(recipe.cuisine)) score += 3

  // Similar to favorites
  const favRecipes = favorites.length > 0 ? 2 : 0
  score += favRecipes

  // Penalize recently cooked
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentlyCooked = cookedHistory.some(
    (h) => h.recipeId === recipe.id && new Date(h.date).getTime() > sevenDaysAgo,
  )
  if (recentlyCooked) score -= 5

  // Spice level match
  if (Math.abs(recipe.spiceLevel - spiceLevel) <= 1) score += 1

  // Random factor
  score += Math.random() * 3

  return score
}

export function RecommendationCarousel() {
  const recipes = useRecipeStore((s) => s.recipes)
  const { favorites, cookedHistory, cuisinePreferences, spiceLevel } = useUserStore()
  const activeMealType = useSpinnerStore((s) => s.activeMealType)

  const recommended = useMemo(() => {
    if (recipes.length === 0) return []

    const mealRecipes = recipes.filter((r) => r.mealTypes.includes(activeMealType))

    return mealRecipes
      .map((recipe) => ({
        recipe,
        score: scoreRecipe(recipe, favorites, cookedHistory, cuisinePreferences, spiceLevel),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((r) => r.recipe)
  }, [recipes, favorites, cookedHistory, cuisinePreferences, spiceLevel, activeMealType])

  if (recommended.length === 0) return null

  return (
    <section className="w-full max-w-4xl">
      <h2 className="font-heading text-xl font-bold text-text-primary mb-4 px-1">
        You Might Like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recommended.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </section>
  )
}
