import { motion, AnimatePresence } from 'motion/react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Recipe } from '../../data/types'

interface SpinResultBannerProps {
  recipes: Recipe[]
  visible: boolean
}

export function SpinResultBanner({ recipes, visible }: SpinResultBannerProps) {
  return (
    <AnimatePresence>
      {visible && recipes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-lg mx-auto"
        >
          <div className="bg-surface-secondary border border-turmeric/30 rounded-2xl p-4 glow-amber">
            <p className="text-xs text-turmeric font-medium uppercase tracking-wider mb-2">
              {recipes.length === 1 ? 'Perfect Match!' : `${recipes.length} Matches Found!`}
            </p>

            <div className="space-y-2">
              {recipes.slice(0, 3).map((recipe) => (
                <Link
                  key={recipe.id}
                  to={`/recipes/${recipe.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-surface-tertiary transition-colors no-underline group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">
                      {recipe.name}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {recipe.cuisine} · {recipe.totalTimeMinutes} min · {recipe.difficulty}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-turmeric transition-colors flex-shrink-0 ml-2" />
                </Link>
              ))}
            </div>

            {recipes.length > 3 && (
              <Link
                to="/recipes"
                className="block text-center text-sm text-turmeric font-medium mt-3 hover:underline no-underline"
              >
                View all {recipes.length} matches
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
