import { useSpinnerStore, type TimeFilter } from '../../stores/spinnerStore'
import { cn } from '../../lib/cn'

const options: { value: TimeFilter; label: string; emoji: string }[] = [
  { value: 'any', label: 'Any time', emoji: '⏳' },
  { value: 20, label: 'Under 20 min', emoji: '⚡' },
  { value: 45, label: 'Under 45 min', emoji: '🕒' },
  { value: 90, label: 'Under 90 min', emoji: '🍖' },
]

export function TimeFilterChips() {
  const { timeFilter, setTimeFilter } = useSpinnerStore()
  return (
    <div className="w-full">
      <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2 text-center">
        How much time tonight?
      </p>
      <div className="flex items-center gap-2 justify-center flex-wrap">
        {options.map((opt) => {
          const active = timeFilter === opt.value
          return (
            <button
              key={String(opt.value)}
              onClick={() => setTimeFilter(opt.value)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
                'border transition-all duration-150',
                active
                  ? 'bg-turmeric/15 text-turmeric border-turmeric/40'
                  : 'bg-surface-secondary text-text-secondary border-border hover:border-turmeric/30',
              )}
            >
              <span className="text-sm leading-none">{opt.emoji}</span>
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
