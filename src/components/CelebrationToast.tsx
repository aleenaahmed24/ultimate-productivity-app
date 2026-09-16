import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { useStore } from '../store/useStore'

export function CelebrationToast() {
  const celebration = useStore((s) => s.lastCelebration)
  const clearCelebration = useStore((s) => s.clearCelebration)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (!celebration) return

    if (celebration.points >= 25) {
      confetti({
        particleCount: Math.min(40 + celebration.points, 140),
        spread: 70,
        origin: { y: 0.3, x: 0.85 },
        colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b'],
      })
    }

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => clearCelebration(), 2800)

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [celebration, clearCelebration])

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex flex-col items-end gap-2 sm:right-6 sm:top-6">
      <AnimatePresence>
        {celebration && (
          <motion.div
            key={celebration.id}
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 card-shadow"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-bg text-white">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">+{celebration.points} points</p>
              <p className="text-xs text-[var(--text-muted)]">{celebration.reason}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
