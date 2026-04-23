import { useUserStore } from '../../stores/userStore'
import { cn } from '../../lib/cn'

const options = [
  { key: 'vegetarian', label: 'Veg', emoji: '🥬' },
  { key: 'non-veg', label: 'Non-veg', emoji: '🍗' },
  { key: 'egg', label: 'Egg-ok', emoji: '🥚' },
  { key: 'gluten-free', label: 'GF', emoji: '🌾' },
  { key: 'dairy-free', label: 'DF', emoji: '🥛' },
]

export function DietaryFilterChips() {
  const { dietaryFilters, toggleDietaryFilter } = useUserStore()
  return (
    <div className="w-full">
      <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-2 text-center">
        What you both can eat
      </p>
      <div className="flex items-center gap-2 justify-center flex-wrap">
        {options.map((opt) => {
          const active = dietaryFilters.includes(opt.key)
          return (
            <button
              key={opt.key}
              onClick={() => toggleDietaryFilter(opt.key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
                'border transition-all duration-150',
                active
                  ? 'bg-coriander/15 text-coriander border-coriander/40'
                  : 'bg-surface-secondary text-text-secondary border-border hover:border-coriander/30',
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
