import { cn } from '../../lib/cn'
import type { MealType } from '../../data/types'

const tabs: { value: MealType; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '☀️' },
  { value: 'dinner', label: 'Dinner', emoji: '🌙' },
  { value: 'snacks', label: 'Snacks', emoji: '🍿' },
]

interface MealTypeTabsProps {
  active: MealType
  onChange: (type: MealType) => void
}

export function MealTypeTabs({ active, onChange }: MealTypeTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-surface-secondary rounded-xl border border-border">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
            active === tab.value
              ? 'bg-turmeric text-white shadow-md'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-tertiary',
          )}
        >
          <span className="text-sm">{tab.emoji}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
