import { motion } from 'motion/react'
import { cn } from '../../lib/cn'

interface SpinButtonProps {
  isSpinning: boolean
  onSpin: () => void
}

export function SpinButton({ isSpinning, onSpin }: SpinButtonProps) {
  return (
    <motion.button
      onClick={onSpin}
      disabled={isSpinning}
      whileTap={isSpinning ? {} : { scale: 0.92 }}
      whileHover={isSpinning ? {} : { scale: 1.05 }}
      className={cn(
        'relative px-10 py-4 rounded-2xl font-heading font-bold text-xl text-white',
        'transition-all duration-300',
        'shadow-lg',
        isSpinning
          ? 'bg-text-muted cursor-not-allowed'
          : 'bg-gradient-to-r from-turmeric to-chili hover:shadow-xl glow-amber',
      )}
    >
      <motion.span
        animate={isSpinning ? { opacity: [1, 0.5, 1] } : {}}
        transition={isSpinning ? { repeat: Infinity, duration: 1 } : {}}
      >
        {isSpinning ? 'Spinning...' : 'SPIN!'}
      </motion.span>
    </motion.button>
  )
}
