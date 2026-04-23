import { useCallback, useEffect, useMemo, useRef } from 'react'
import { motion } from 'motion/react'
import { Reel } from './Reel'
import { SpinButton } from './SpinButton'
import { MealTypeTabs } from './MealTypeTabs'
import { SpinResultBanner } from './SpinResultBanner'
import { TimeFilterChips } from './TimeFilterChips'
import { DietaryFilterChips } from './DietaryFilterChips'
import { useSpinnerStore } from '../../stores/spinnerStore'
import { useRecipeStore } from '../../stores/recipeStore'
import { useUserStore } from '../../stores/userStore'
import { cuisineOptions, styleOptions, proteinOptions } from '../../data/reelOptions'
import { cn } from '../../lib/cn'
import type { MealType } from '../../data/types'

export function SpinnerHousing() {
  const {
    activeMealType, setActiveMealType,
    lockedReels, toggleLock, setLocks,
    isSpinning, setSpinning,
    setReelValue, reelValues,
    lastResult, setLastResult,
    addSpinResult,
    timeFilter, setTimeFilter,
  } = useSpinnerStore()

  const dietaryFilters = useUserStore((s) => s.dietaryFilters)
  const toggleDietaryFilter = useUserStore((s) => s.toggleDietaryFilter)

  const getMatchingRecipes = useRecipeStore((s) => s.getMatchingRecipes)

  const matchOptions = useMemo(
    () => ({
      maxTimeMinutes: timeFilter === 'any' ? undefined : timeFilter,
      dietaryFilters,
    }),
    [timeFilter, dietaryFilters],
  )

  const matchedRecipes = lastResult
    ? getMatchingRecipes(
        lastResult.cuisine,
        lastResult.style,
        lastResult.protein,
        lastResult.mealType,
        matchOptions,
      )
    : []

  const isExactMatch = useMemo(() => {
    if (!lastResult || matchedRecipes.length === 0) return false
    return matchedRecipes.some(
      (r) =>
        r.cuisine === lastResult.cuisine &&
        r.style === lastResult.style &&
        r.proteinBase === lastResult.protein,
    )
  }, [lastResult, matchedRecipes])

  const landedReels = useRef(0)

  // Seed reels to the first option of each list on mount / meal-type change.
  useEffect(() => {
    const defaults: [string, string, string] = [
      cuisineOptions[activeMealType][0]?.value ?? '',
      styleOptions[activeMealType][0]?.value ?? '',
      proteinOptions[activeMealType][0]?.value ?? '',
    ]
    setReelValue(0, defaults[0])
    setReelValue(1, defaults[1])
    setReelValue(2, defaults[2])
    setLastResult(null)
  }, [activeMealType])

  const handleSpin = useCallback(() => {
    if (isSpinning) return
    setLastResult(null)
    setSpinning(true)
    landedReels.current = 0
  }, [isSpinning])

  const handleReelLand = useCallback((index: 0 | 1 | 2, value: string) => {
    setReelValue(index, value)
    landedReels.current++

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

  // Manual pick from a reel — recompute matches immediately.
  const handleReelSelect = useCallback((index: 0 | 1 | 2, value: string) => {
    if (isSpinning) return
    setReelValue(index, value)
    const state = useSpinnerStore.getState()
    const values: [string, string, string] = [...state.reelValues] as [string, string, string]
    values[index] = value
    setLastResult({
      cuisine: values[0],
      style: values[1],
      protein: values[2],
      mealType: activeMealType,
      timestamp: Date.now(),
    })
  }, [activeMealType, isSpinning])

  // "Different cuisine / style / protein" reroll: lock two reels, spin the third.
  const handleRerollReel = useCallback((keepLocked: [boolean, boolean, boolean]) => {
    if (isSpinning) return
    setLocks(keepLocked)
    setLastResult(null)
    setSpinning(true)
    landedReels.current = 0
  }, [isSpinning])

  const handleClearFilters = useCallback(() => {
    setTimeFilter('any')
    // Clear each active dietary filter
    dietaryFilters.forEach((f) => toggleDietaryFilter(f))
  }, [dietaryFilters, setTimeFilter, toggleDietaryFilter])

  const timeLabelFor = (tf: typeof timeFilter): string | null => {
    if (tf === 'any') return null
    return `Under ${tf} min`
  }

  // Handle all-locked spin → instant result
  useEffect(() => {
    if (isSpinning) {
      const lockedCount = lockedReels.filter(Boolean).length
      if (lockedCount === 3) {
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
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
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
    <div className="flex flex-col items-center gap-5 w-full">
      <MealTypeTabs active={activeMealType} onChange={(t: MealType) => setActiveMealType(t)} />

      {/* Constraints row — time + dietary */}
      <div className="w-full max-w-lg space-y-3">
        <TimeFilterChips />
        <DietaryFilterChips />
      </div>

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
            value={reelValues[0]}
            isLocked={lockedReels[0]}
            isSpinning={isSpinning}
            onToggleLock={() => toggleLock(0)}
            onLand={(v) => handleReelLand(0, v)}
            onSelect={(v) => handleReelSelect(0, v)}
            delay={0}
          />
          <Reel
            options={styleOptions[activeMealType]}
            label="Style"
            value={reelValues[1]}
            isLocked={lockedReels[1]}
            isSpinning={isSpinning}
            onToggleLock={() => toggleLock(1)}
            onLand={(v) => handleReelLand(1, v)}
            onSelect={(v) => handleReelSelect(1, v)}
            delay={400}
          />
          <Reel
            options={proteinOptions[activeMealType]}
            label="Protein"
            value={reelValues[2]}
            isLocked={lockedReels[2]}
            isSpinning={isSpinning}
            onToggleLock={() => toggleLock(2)}
            onLand={(v) => handleReelLand(2, v)}
            onSelect={(v) => handleReelSelect(2, v)}
            delay={800}
          />
        </div>
      </motion.div>

      <SpinButton isSpinning={isSpinning} onSpin={handleSpin} />

      <SpinResultBanner
        recipes={matchedRecipes}
        visible={!!lastResult && !isSpinning}
        isExactMatch={isExactMatch}
        activeFilters={{
          timeLabel: timeLabelFor(timeFilter),
          dietary: dietaryFilters,
        }}
        onRerollReel={handleRerollReel}
        onClearFilters={handleClearFilters}
      />

      {/* Keyboard hint (desktop only) */}
      <p className="hidden lg:block text-xs text-text-muted text-center">
        Press <kbd className="px-1.5 py-0.5 rounded bg-surface-tertiary text-text-secondary font-mono text-[10px]">Space</kbd> to spin · <kbd className="px-1.5 py-0.5 rounded bg-surface-tertiary text-text-secondary font-mono text-[10px]">1</kbd> <kbd className="px-1.5 py-0.5 rounded bg-surface-tertiary text-text-secondary font-mono text-[10px]">2</kbd> <kbd className="px-1.5 py-0.5 rounded bg-surface-tertiary text-text-secondary font-mono text-[10px]">3</kbd> to lock · drag or scroll a reel to pick manually
      </p>
    </div>
  )
}
