import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { searchCatalog } from '../../lib/pantryMatch'
import { ingredientById } from '../../data/ingredients'
import { cn } from '../../lib/cn'

interface Props {
  pantryIds: string[]
  onAdd: (id: string) => void
}

/**
 * Typeahead input. Shows up to 8 suggestions from the canonical catalog
 * (excluding staples/spices and items already in the pantry). Keyboard:
 * ↑/↓ navigate, Enter to add the highlighted suggestion.
 */
export function IngredientInput({ pantryIds, onAdd }: Props) {
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inPantry = useMemo(() => new Set(pantryIds), [pantryIds])

  const suggestions = useMemo(() => {
    return searchCatalog(query).filter((s) => !inPantry.has(s.id))
  }, [query, inPantry])

  // Close on click-outside
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  function handleAdd(id: string) {
    onAdd(id)
    setQuery('')
    setHighlight(0)
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setHighlight(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setHighlight((h) => Math.min(h + 1, suggestions.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setHighlight((h) => Math.max(h - 1, 0))
            } else if (e.key === 'Enter' && suggestions.length > 0) {
              e.preventDefault()
              handleAdd(suggestions[highlight].id)
            } else if (e.key === 'Escape') {
              setOpen(false)
              setQuery('')
            }
          }}
          placeholder="Type an ingredient (e.g. chicken, paneer, tomato)..."
          className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-surface-secondary border border-border focus:border-turmeric/60 focus:outline-none text-sm text-text-primary placeholder:text-text-muted shadow-sm"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <AnimatePresence>
        {open && query && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-30 left-0 right-0 mt-2 rounded-xl bg-surface-secondary border border-border shadow-xl overflow-hidden"
          >
            {suggestions.map((s, idx) => {
              const ing = ingredientById.get(s.id)!
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlight(idx)}
                    onClick={() => handleAdd(s.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                      idx === highlight
                        ? 'bg-turmeric/10 text-turmeric'
                        : 'text-text-primary hover:bg-surface-tertiary',
                    )}
                  >
                    <span className="text-lg leading-none">{ing.emoji ?? '•'}</span>
                    <span className="flex-1 min-w-0 truncate">{ing.label}</span>
                    <Plus className="w-4 h-4 opacity-60" />
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
        {open && query && suggestions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-30 left-0 right-0 mt-2 rounded-xl bg-surface-secondary border border-border shadow-xl px-4 py-3 text-sm text-text-muted"
          >
            No match in our ingredient list.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
