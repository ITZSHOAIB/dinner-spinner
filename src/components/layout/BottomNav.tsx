import { Link, useLocation } from 'react-router-dom'
import { Disc3, BookOpen, ChefHat, Heart, User } from 'lucide-react'
import { cn } from '../../lib/cn'

const navItems = [
  { path: '/', label: 'Spin', icon: Disc3 },
  { path: '/recipes', label: 'Browse', icon: BookOpen },
  { path: '/pantry', label: 'Pantry', icon: ChefHat },
  { path: '/favorites', label: 'Favorites', icon: Heart },
  { path: '/preferences', label: 'Profile', icon: User },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition-colors no-underline flex-1 min-w-0',
                active
                  ? 'text-turmeric'
                  : 'text-text-muted',
              )}
            >
              <Icon className={cn('w-5 h-5', active && 'fill-turmeric/20')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
