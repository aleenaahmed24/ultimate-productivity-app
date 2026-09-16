import { motion } from 'framer-motion'

export function ProgressBar({
  progress,
  height = 10,
  colorClass = 'gradient-bg',
}: {
  progress: number
  height?: number
  colorClass?: string
}) {
  const pct = Math.max(0, Math.min(1, progress)) * 100
  return (
    <div
      className="w-full rounded-full overflow-hidden bg-[var(--surface-2)]"
      style={{ height }}
    >
      <motion.div
        className={`h-full rounded-full ${colorClass}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
  )
}
