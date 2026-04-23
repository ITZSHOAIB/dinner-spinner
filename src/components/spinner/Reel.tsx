import { useEffect, useRef, useState } from 'react'
import { motion, useAnimation } from 'motion/react'
import { Lock, Unlock } from 'lucide-react'
import { cn } from '../../lib/cn'
import type { ReelOption } from '../../data/types'

interface ReelProps {
  options: ReelOption[]
  label: string
  isLocked: boolean
  isSpinning: boolean
  onToggleLock: () => void
  onLand: (value: string) => void
  delay: number // staggered stop delay in ms
}

const ITEM_HEIGHT = 72
const VISIBLE_ITEMS = 3

export function Reel({ options, label, isLocked, isSpinning, onToggleLock, onLand, delay }: ReelProps) {
  const controls = useAnimation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)

  // Create extended list for infinite scroll illusion
  const extendedOptions = [...options, ...options, ...options]

  useEffect(() => {
    if (isSpinning && !isLocked) {
      setSpinning(true)

      // Fast scroll phase
      let tick = 0
      intervalRef.current = setInterval(() => {
        tick++
        setCurrentIndex((prev) => (prev + 1) % options.length)
      }, 80)

      // Stop after delay
      const stopTimer = setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)

        // Pick random landing
        const landIndex = Math.floor(Math.random() * options.length)
        setCurrentIndex(landIndex)
        setSpinning(false)

        // Animate to final position with spring
        controls.start({
          y: -(landIndex * ITEM_HEIGHT),
          transition: {
            type: 'spring',
            stiffness: 200,
            damping: 25,
            mass: 1,
          },
        })

        onLand(options[landIndex].value)
      }, 1500 + delay)

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        clearTimeout(stopTimer)
      }
    }
  }, [isSpinning])

  // Update position during fast spin
  useEffect(() => {
    if (spinning) {
      controls.start({
        y: -(currentIndex * ITEM_HEIGHT),
        transition: { duration: 0.06, ease: 'linear' },
      })
    }
  }, [currentIndex, spinning])

  // Initialize position
  useEffect(() => {
    if (!isSpinning && options.length > 0) {
      const idx = options.findIndex((o) => o.value === options[currentIndex]?.value) ?? 0
      controls.set({ y: -(idx * ITEM_HEIGHT) })
    }
  }, [options])

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
        {label}
      </span>

      <div className="relative">
        {/* Reel window */}
        <div
          className={cn(
            'relative w-[90px] sm:w-[120px] lg:w-[160px] overflow-hidden rounded-2xl',
            'bg-surface-secondary border-2 border-border',
            'shadow-lg',
            spinning && 'spinner-blur',
            !spinning && !isSpinning && 'transition-shadow duration-500',
          )}
          style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}
        >
          {/* Gradient overlays for depth */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-surface-secondary to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-secondary to-transparent z-10 pointer-events-none" />

          {/* Center highlight bar */}
          <div
            className={cn(
              'absolute inset-x-2 z-10 rounded-xl pointer-events-none transition-all duration-500',
              !spinning && !isSpinning ? 'bg-turmeric/10 border border-turmeric/30' : 'bg-surface-tertiary/50',
            )}
            style={{
              top: ITEM_HEIGHT,
              height: ITEM_HEIGHT,
            }}
          />

          {/* Scrolling items */}
          <motion.div animate={controls} className="relative">
            {extendedOptions.map((option, i) => (
              <div
                key={`${option.value}-${i}`}
                className="flex flex-col items-center justify-center"
                style={{ height: ITEM_HEIGHT }}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="text-xs sm:text-sm font-medium text-text-primary mt-0.5 truncate max-w-full px-2">
                  {option.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Lock button */}
        <button
          onClick={onToggleLock}
          className={cn(
            'absolute -bottom-3 left-1/2 -translate-x-1/2 z-20',
            'w-8 h-8 rounded-full flex items-center justify-center',
            'border-2 transition-all duration-200',
            'shadow-md',
            isLocked
              ? 'bg-turmeric border-turmeric text-white scale-110'
              : 'bg-surface border-border text-text-muted hover:border-turmeric/50 hover:text-turmeric',
          )}
          aria-label={isLocked ? `Unlock ${label} reel` : `Lock ${label} reel`}
        >
          {isLocked ? (
            <Lock className="w-3.5 h-3.5" />
          ) : (
            <Unlock className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  )
}
