import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'
import { findSubstitutions } from '../../lib/substitutions'

interface IngredientChipProps {
  name: string
}

// A key-ingredient chip. When substitution suggestions exist for the
// ingredient, the chip gets a chevron affordance and opens a popover with 1–3
// alternatives. Plain, non-interactive chip otherwise.
export function IngredientChip({ name }: IngredientChipProps) {
  const subs = useMemo(() => findSubstitutions(name), [name])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!subs) {
    return (
      <span className="px-3 py-1.5 rounded-lg bg-turmeric/10 text-turmeric text-sm font-medium">
        {name}
      </span>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
          open
            ? 'bg-turmeric/20 text-turmeric ring-1 ring-turmeric/40'
            : 'bg-turmeric/10 text-turmeric hover:bg-turmeric/15',
        )}
      >
        {name}
        <ChevronDown
          className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={`Substitutes for ${name}`}
          className="absolute top-full left-0 mt-2 z-20 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface shadow-lg p-4"
        >
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wide mb-3">
            Instead of {name}, try
          </p>
          <ul className="space-y-3 mb-3">
            {subs.map((s) => (
              <li key={s.name}>
                <p className="text-sm font-medium text-text-primary">
                  {s.name}
                  {s.ratio && (
                    <span className="ml-2 text-xs text-text-muted font-normal">
                      {s.ratio}
                    </span>
                  )}
                </p>
                {s.note && (
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    {s.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-text-muted italic border-t border-border-subtle pt-2">
            Common swaps — results may vary.
          </p>
        </div>
      )}
    </div>
  )
}
