import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronRight, ChevronDown, Clock, ChefHat, Shuffle, FilterX, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Recipe } from '../../data/types'
import { cn } from '../../lib/cn'

interface ActiveFilters {
  timeLabel: string | null
  dietary: string[]
}

interface SpinResultBannerProps {
  recipes: Recipe[]
  visible: boolean
  isExactMatch: boolean
  activeFilters: ActiveFilters
  onRerollReel?: (keepLocked: [boolean, boolean, boolean]) => void
  onClearFilters?: () => void
}

function whyThis(r: Recipe): string {
  const bits: string[] = []

  if (r.totalTimeMinutes <= 20) bits.push(`Ready in ${r.totalTimeMinutes} min`)
  else bits.push(`${r.totalTimeMinutes} min`)

  bits.push(r.difficulty === 'easy' ? 'Easy' : r.difficulty === 'medium' ? 'Medium' : 'Involved')

  const keys = r.keyIngredients.slice(0, 3).join(', ')
  if (keys) bits.push(`Uses ${keys}`)

  if (r.servings) bits.push(`Serves ${r.servings}`)

  return bits.join(' · ')
}

export function SpinResultBanner({
  recipes,
  visible,
  isExactMatch,
  activeFilters,
  onRerollReel,
  onClearFilters,
}: SpinResultBannerProps) {
  const [showAll, setShowAll] = useState(false)
  const top = recipes[0]
  const hasActiveFilters = !!activeFilters.timeLabel || activeFilters.dietary.length > 0

  // Collapse back when the recipe set changes (new spin / filter change)
  useEffect(() => {
    setShowAll(false)
  }, [recipes])

  const altsToShow = showAll ? recipes.slice(1) : recipes.slice(1, 3)
  const hiddenCount = Math.max(0, recipes.length - 1 - altsToShow.length)

  // Empty state — spin happened, filters too restrictive
  if (visible && recipes.length === 0) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-lg mx-auto"
        >
          <div className="bg-surface-secondary border border-chili/30 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-chili/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-chili" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">
                  No dishes match right now
                </p>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  {hasActiveFilters
                    ? 'Your filters are narrowing things down too much. Try loosening one:'
                    : 'We couldn’t find anything for that combo. Try rerolling or adjusting the reels.'}
                </p>

                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {activeFilters.timeLabel && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-turmeric/10 text-turmeric text-[11px] font-medium border border-turmeric/20">
                        <Clock className="w-3 h-3" />
                        {activeFilters.timeLabel}
                      </span>
                    )}
                    {activeFilters.dietary.map((d) => (
                      <span
                        key={d}
                        className="px-2 py-0.5 rounded-full bg-coriander/10 text-coriander text-[11px] font-medium border border-coriander/20 capitalize"
                      >
                        {d.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {hasActiveFilters && onClearFilters && (
                    <button
                      type="button"
                      onClick={onClearFilters}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-chili/10 text-chili border border-chili/20 text-[11px] font-medium hover:bg-chili/20 transition-colors"
                    >
                      <FilterX className="w-3 h-3" />
                      Clear filters
                    </button>
                  )}
                  {onRerollReel && (
                    <>
                      <RerollChip
                        label="Different cuisine"
                        onClick={() => onRerollReel([false, true, true])}
                      />
                      <RerollChip
                        label="Different style"
                        onClick={() => onRerollReel([true, false, true])}
                      />
                      <RerollChip
                        label="Different protein"
                        onClick={() => onRerollReel([true, true, false])}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {visible && recipes.length > 0 && top && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-lg mx-auto"
        >
          <div className="bg-surface-secondary border border-turmeric/30 rounded-2xl p-4 glow-amber">
            <p className="text-xs text-turmeric font-medium uppercase tracking-wider mb-2">
              {isExactMatch
                ? recipes.length === 1
                  ? 'Perfect match'
                  : `${recipes.length} perfect matches`
                : 'Closest we could find'}
            </p>

            {/* Top pick — with "why this" */}
            <Link
              to={`/recipes/${top.id}`}
              className="block p-3 rounded-xl bg-surface hover:bg-surface-tertiary transition-colors no-underline group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary truncate">{top.name}</p>
                  <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5 flex-wrap">
                    <Clock className="w-3 h-3 text-turmeric flex-shrink-0" />
                    <span className="font-medium">{top.totalTimeMinutes} min</span>
                    <span className="text-text-muted">·</span>
                    <ChefHat className="w-3 h-3 text-turmeric flex-shrink-0" />
                    <span className="capitalize">{top.difficulty}</span>
                    <span className="text-text-muted">·</span>
                    <span>Serves {top.servings}</span>
                  </p>
                  <p className="text-[11px] text-text-muted mt-1.5 leading-relaxed">
                    {whyThis(top)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-turmeric transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>

            {/* Alt picks */}
            {altsToShow.length > 0 && (
              <motion.div
                initial={false}
                className={cn(
                  'mt-2 space-y-1.5',
                  showAll && recipes.length > 6 && 'max-h-[280px] overflow-y-auto pr-1',
                )}
              >
                {altsToShow.map((r) => (
                  <Link
                    key={r.id}
                    to={`/recipes/${r.id}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface/60 hover:bg-surface-tertiary transition-colors no-underline group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">{r.name}</p>
                      <p className="text-[11px] text-text-muted">
                        {r.totalTimeMinutes} min · {r.difficulty}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:text-turmeric transition-colors flex-shrink-0 ml-2" />
                  </Link>
                ))}
              </motion.div>
            )}

            {(hiddenCount > 0 || (showAll && recipes.length > 3)) && (
              <button
                type="button"
                onClick={() => setShowAll((s) => !s)}
                className="w-full flex items-center justify-center gap-1 text-xs text-turmeric font-medium mt-2.5 hover:underline"
              >
                {showAll ? (
                  <>Show fewer <ChevronDown className="w-3.5 h-3.5 rotate-180" /></>
                ) : (
                  <>Show {hiddenCount} more {hiddenCount === 1 ? 'match' : 'matches'} <ChevronDown className="w-3.5 h-3.5" /></>
                )}
              </button>
            )}

            {/* Reroll row — tailored for couples going "hmm, not this" */}
            {onRerollReel && (
              <div className="mt-3 pt-3 border-t border-border-subtle">
                <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">
                  Not feeling it? Try
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <RerollChip
                    label="Different cuisine"
                    onClick={() => onRerollReel([false, true, true])}
                  />
                  <RerollChip
                    label="Different style"
                    onClick={() => onRerollReel([true, false, true])}
                  />
                  <RerollChip
                    label="Different protein"
                    onClick={() => onRerollReel([true, true, false])}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function RerollChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-surface border border-border text-[11px] font-medium text-text-secondary hover:border-turmeric/40 hover:text-turmeric transition-colors"
    >
      <Shuffle className="w-3 h-3" />
      {label}
    </button>
  )
}
