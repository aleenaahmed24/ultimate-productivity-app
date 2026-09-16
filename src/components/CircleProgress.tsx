import { motion } from 'framer-motion'
import { useId } from 'react'

export function CircleProgress({
  progress,
  size = 96,
  strokeWidth = 10,
  label,
  sublabel,
}: {
  progress: number
  size?: number
  strokeWidth?: number
  label?: string
  sublabel?: string
}) {
  const gradientId = useId()
  const pct = Math.max(0, Math.min(1, progress))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'var(--grad-a)' }} />
            <stop offset="50%" style={{ stopColor: 'var(--grad-b)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--grad-c)' }} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ type: 'spring', stiffness: 90, damping: 20 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        {label && <span className="text-lg font-bold text-[var(--text)]">{label}</span>}
        {sublabel && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}
