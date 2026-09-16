export interface RingBlock {
  id: string
  done: boolean
  colorDone: string
  colorMuted: string
}

export function DailyBlocksRing({
  blocks,
  size = 128,
  strokeWidth = 14,
  gap = 3,
}: {
  blocks: RingBlock[]
  size?: number
  strokeWidth?: number
  gap?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const n = blocks.length
  const doneCount = blocks.filter((b) => b.done).length
  const pct = n ? Math.round((doneCount / n) * 100) : 0
  const fullSeg = n ? circumference / n : 0
  const segLen = Math.max(fullSeg - gap, 1)

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={strokeWidth}
        />
        {n > 0 &&
          blocks.map((b, i) => (
            <circle
              key={b.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={b.done ? b.colorDone : b.colorMuted}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${segLen} ${circumference - segLen}`}
              strokeDashoffset={-(i * fullSeg)}
              style={{ transition: 'stroke 0.3s ease' }}
            />
          ))}
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[var(--text)]">{n ? `${pct}%` : '—'}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {n ? 'Done today' : 'Nothing yet'}
        </span>
      </div>
    </div>
  )
}
