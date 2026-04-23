import { Shuffle, Zap, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSpinnerStore } from '../../stores/spinnerStore'
import { useRecipeStore } from '../../stores/recipeStore'

export function QuickActions() {
  const { setSpinning, setLastResult, addSpinResult, activeMealType, resetLocks } = useSpinnerStore()
  const recipes = useRecipeStore((s) => s.recipes)
  const navigate = useNavigate()

  const surpriseMe = () => {
    resetLocks()
    setLastResult(null)
    setSpinning(true)
  }

  const quickPick = () => {
    if (recipes.length === 0) return
    const mealRecipes = recipes.filter((r) => r.mealTypes.includes(activeMealType))
    if (mealRecipes.length === 0) return
    const pick = mealRecipes[Math.floor(Math.random() * mealRecipes.length)]
    navigate(`/recipes/${pick.id}`)
  }

  return (
    <div className="flex items-center gap-3 flex-wrap justify-center">
      <button
        onClick={surpriseMe}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-secondary border border-border hover:border-turmeric/30 text-sm font-medium text-text-secondary hover:text-turmeric transition-all"
      >
        <Shuffle className="w-4 h-4" />
        Surprise Me
      </button>
      <button
        onClick={quickPick}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-secondary border border-border hover:border-turmeric/30 text-sm font-medium text-text-secondary hover:text-turmeric transition-all"
      >
        <Zap className="w-4 h-4" />
        Quick Pick
      </button>
      <button
        onClick={() => navigate('/recipes')}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-secondary border border-border hover:border-turmeric/30 text-sm font-medium text-text-secondary hover:text-turmeric transition-all"
      >
        <Sparkles className="w-4 h-4" />
        Browse All
      </button>
    </div>
  )
}
