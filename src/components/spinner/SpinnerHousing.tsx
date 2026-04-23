import { useCallback, useEffect } from 'react'
import { motion } from 'motion/react'
import { Reel } from './Reel'
import { SpinButton } from './SpinButton'
import { MealTypeTabs } from './MealTypeTabs'
import { SpinResultBanner } from './SpinResultBanner'
import { useSpinnerStore } from '../../stores/spinnerStore'
import { useRecipeStore } from '../../stores/recipeStore'
import { cuisineOptions, styleOptions, proteinOptions } from '../../data/reelOptions'
import { cn } from '../../lib/cn'

export function SpinnerHousing() {
  const {
    activeMealType, setActiveMealType,
    lockedReels, toggleLock,
    isSpinning, setSpinning,
    setReelValue, reelValues,
    lastResult, setLastResult,
    addSpinResult,
  } = useSpinnerStore()

  const getMatchingRecipes = useRecipeStore((s) => s.getMatchingRecipes)

  const matchedRecipes = lastResult
    ? getMatchingRecipes(lastResult.cuisine, lastResult.style, lastResult.protein, lastResult.mealType)
    : []

  const landedReels = { current: 0 }

  const handleSpin = useCallback(() => {
    if (isSpinning) return
    setLastResult(null)
    setSpinning(true)
    landedReels.current = 0
  }, [isSpinning])

  const handleReelLand = useCallback((index: 0 | 1 | 2, value: string) => {
    setReelValue(index, value)
    landedReels.current++

    // Check if all unlocked reels have landed
    const unlockedCount = [0, 1, 2].filter((i) => !useSpinnerStore.getState().lockedReels[i as 0 | 1 | 2]).length
    if (landedReels.current >= unlockedCount) {
      const state = useSpinnerStore.getState()
      const result = {
        cuisine: state.reelValues[0],
        style: state.reelValues[1],
        protein: state.reelValues[2],
        mealType: activeMealType,
        timestamp: Date.now(),
      }
      setLastResult(result)
      addSpinResult(result)
      setSpinning(false)
    }
  }, [activeMealType])

  // Handle locked reels completing instantly
  useEffect(() => {
    if (isSpinning) {
      const lockedCount = lockedReels.filter(Boolean).length
      if (lockedCount === 3) {
        // All locked — instant result
        const result = {
          cuisine: reelValues[0],
          style: reelValues[1],
          protein: reelValues[2],
          mealType: activeMealType,
          timestamp: Date.now(),
        }
        setLastResult(result)
        addSpinResult(result)
        setSpinning(false)
      }
    }
  }, [isSpinning])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        handleSpin()
      }
      if (e.key === '1') toggleLock(0)
      if (e.key === '2') toggleLock(1)
      if (e.key === '3') toggleLock(2)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSpin])

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <MealTypeTabs active={activeMealType} onChange={setActiveMealType} />

      {/* Spinner frame */}
      <motion.div
        animate={
          lastResult && !isSpinning
            ? { boxShadow: '0 0 30px rgba(245, 158, 11, 0.4), 0 0 80px rgba(245, 158, 11, 0.15)' }
            : { boxShadow: '0 0 0px rgba(245, 158, 11, 0)' }
        }
        transition={{ duration: 0.6 }}
        className={cn(
          'relative p-6 sm:p-8 rounded-3xl',
          'bg-gradient-to-b from-surface-secondary to-surface',
          'border border-border',
        )}
      >
        <div className="flex items-start gap-3 sm:gap-5 lg:gap-8">
          <Reel
            options={cuisineOptions[activeMealType]}
            label="Cuisine"
            isLocked={lockedReels[0]}
            isSpinning={isSpinning}
            onToggleLock={() => toggleLock(0)}
            onLand={(v) => handleReelLand(0, v)}
            delay={0}
          />
          <Reel
            options={styleOptions[activeMealType]}
            label="Style"
            isLocked={lockedReels[1]}
            isSpinning={isSpinning}
            onToggleLock={() => toggleLock(1)}
            onLand={(v) => handleReelLand(1, v)}
            delay={400}
          />
          <Reel
            options={proteinOptions[activeMealType]}
            label="Protein"
            isLocked={lockedReels[2]}
            isSpinning={isSpinning}
            onToggleLock={() => toggleLock(2)}
            onLand={(v) => handleReelLand(2, v)}
            delay={800}
          />
        </div>
      </motion.div>

      <SpinButton isSpinning={isSpinning} onSpin={handleSpin} />

      <SpinResultBanner
        recipes={matchedRecipes}
        visible={!!lastResult && !isSpinning}
      />

      {/* Keyboard hint (desktop only) */}
      <p className="hidden lg:block text-xs text-text-muted">
        Press <kbd className="px-1.5 py-0.5 rounded bg-surface-tertiary text-text-secondary font-mono text-[10px]">Space</kbd> to spin · <kbd className="px-1.5 py-0.5 rounded bg-surface-tertiary text-text-secondary font-mono text-[10px]">1</kbd> <kbd className="px-1.5 py-0.5 rounded bg-surface-tertiary text-text-secondary font-mono text-[10px]">2</kbd> <kbd className="px-1.5 py-0.5 rounded bg-surface-tertiary text-text-secondary font-mono text-[10px]">3</kbd> to lock reels
      </p>
    </div>
  )
}
