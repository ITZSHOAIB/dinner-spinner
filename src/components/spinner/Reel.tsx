import { useEffect, useRef, useState } from 'react'
import { motion, useAnimation, useMotionValue } from 'motion/react'
import { Lock, Unlock } from 'lucide-react'
import { cn } from '../../lib/cn'
import type { ReelOption } from '../../data/types'

interface ReelProps {
  options: ReelOption[]
  label: string
  value: string
  isLocked: boolean
  isSpinning: boolean
  onToggleLock: () => void
  onLand: (value: string) => void
  onSelect: (value: string) => void
  delay: number
}

const ITEM_HEIGHT = 72
const VISIBLE_ITEMS = 3

export function Reel({
  options,
  label,
  value,
  isLocked,
  isSpinning,
  onToggleLock,
  onLand,
  onSelect,
  delay,
}: ReelProps) {
  const controls = useAnimation()
  const y = useMotionValue(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)

  const yForIndex = (i: number) => -(i * ITEM_HEIGHT)

  // Spin handling
  useEffect(() => {
    if (isSpinning && !isLocked) {
      setSpinning(true)

      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % options.length)
      }, 80)

      const stopTimer = setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)

        const landIndex = Math.floor(Math.random() * options.length)
        setCurrentIndex(landIndex)
        setSpinning(false)

        controls.start({
          y: yForIndex(landIndex),
          transition: { type: 'spring', stiffness: 200, damping: 25, mass: 1 },
        })

        onLand(options[landIndex].value)
      }, 1500 + delay)

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        clearTimeout(stopTimer)
      }
    }
  }, [isSpinning])

  // Fast-scroll during spin
  useEffect(() => {
    if (spinning) {
      controls.start({
        y: yForIndex(currentIndex),
        transition: { duration: 0.06, ease: 'linear' },
      })
    }
  }, [currentIndex, spinning])

  // Sync display to external `value` (manual pick / meal-type change)
  useEffect(() => {
    if (isSpinning || spinning) return
    const idx = options.findIndex((o) => o.value === value)
    const targetIdx = idx >= 0 ? idx : 0
    setCurrentIndex(targetIdx)
    controls.start({
      y: yForIndex(targetIdx),
      transition: { type: 'spring', stiffness: 260, damping: 28 },
    })
  }, [value, options, isSpinning])

  const snapToNearest = (currentY: number) => {
    const rawIdx = Math.round(-currentY / ITEM_HEIGHT)
    const clamped = Math.max(0, Math.min(options.length - 1, rawIdx))
    controls.start({
      y: yForIndex(clamped),
      transition: { type: 'spring', stiffness: 320, damping: 30 },
    })
    setCurrentIndex(clamped)
    const picked = options[clamped].value
    if (picked !== value) onSelect(picked)
  }

  // Wheel scroll (desktop) — step per threshold of accumulated delta
  const wheelAccum = useRef(0)
  const wheelTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const handleWheel = (e: React.WheelEvent) => {
    if (isSpinning || isLocked) return
    wheelAccum.current += e.deltaY
    const threshold = 30
    if (Math.abs(wheelAccum.current) >= threshold) {
      const step = wheelAccum.current > 0 ? 1 : -1
      wheelAccum.current = 0
      const next = Math.max(0, Math.min(options.length - 1, currentIndex + step))
      if (next !== currentIndex) {
        setCurrentIndex(next)
        controls.start({
          y: yForIndex(next),
          transition: { type: 'spring', stiffness: 320, damping: 30 },
        })
        if (wheelTimer.current) clearTimeout(wheelTimer.current)
        wheelTimer.current = setTimeout(() => {
          const picked = options[next].value
          if (picked !== value) onSelect(picked)
        }, 120)
      }
    }
  }

  const draggable = !isSpinning && !isLocked

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
        {label}
      </span>

      <div className="relative">
        {/* Reel window */}
        <div
          onWheel={handleWheel}
          className={cn(
            'relative w-[90px] sm:w-[120px] lg:w-[160px] overflow-hidden rounded-2xl',
            'bg-surface-secondary border-2 shadow-lg select-none',
            spinning && 'spinner-blur',
            !spinning && !isSpinning && 'transition-colors duration-300',
            isLocked ? 'border-turmeric/60' : 'border-border',
            draggable && 'cursor-grab active:cursor-grabbing',
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

          {/* Scrolling / draggable items */}
          <motion.div
            animate={controls}
            style={{ y }}
            drag={draggable ? 'y' : false}
            dragConstraints={{
              top: yForIndex(options.length - 1),
              bottom: 0,
            }}
            dragElastic={0.15}
            dragMomentum={false}
            onDragEnd={() => snapToNearest(y.get())}
            className="relative touch-none"
          >
            {/* top spacer — keeps first item centerable */}
            <div style={{ height: ITEM_HEIGHT }} aria-hidden />
            {options.map((option, i) => (
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
            {/* bottom spacer */}
            <div style={{ height: ITEM_HEIGHT }} aria-hidden />
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
