import { motion, AnimatePresence } from 'motion/react'
import { X, Check } from 'lucide-react'
import { canonicalIngredients } from '../../data/ingredients'
import { usePantryStore } from '../../stores/pantryStore'
import { cn } from '../../lib/cn'

interface Props {
  open: boolean
  onClose: () => void
}

/**
 * Bottom-sheet (mobile) / centered modal (desktop) for toggling the
 * default staples. Excluded staples become "required" — recipes that need
 * them will show as missing rather than cookable.
 */
export function StaplesPanel({ open, onClose }: Props) {
  const excluded = usePantryStore((s) => s.excludedStapleIds)
  const toggleStaple = usePantryStore((s) => s.toggleStaple)

  const staples = canonicalIngredients.filter((i) => i.isStapleByDefault)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-50 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-6"
          >
            <div className="bg-surface rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl max-w-lg mx-auto sm:w-full overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary">
                    Pantry staples
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Toggle off anything you've actually run out of.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 -m-2 rounded-lg hover:bg-surface-tertiary transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {staples.map((s) => {
                    const isOn = !excluded.includes(s.id)
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleStaple(s.id)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all',
                          isOn
                            ? 'bg-coriander/10 border-coriander/30 text-text-primary'
                            : 'bg-surface-secondary border-border text-text-muted',
                        )}
                      >
                        <span
                          className={cn(
                            'w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-colors',
                            isOn ? 'bg-coriander text-white' : 'bg-border',
                          )}
                        >
                          {isOn && <Check className="w-3 h-3" />}
                        </span>
                        <span className="truncate font-medium">{s.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="px-5 py-3 border-t border-border bg-surface-secondary/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-turmeric text-white font-medium text-sm hover:bg-turmeric-light transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
