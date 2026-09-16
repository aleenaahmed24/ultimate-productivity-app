const PALETTE = [
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#22c55e',
  '#16a34a',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#64748b',
  '#71717a',
]

export function ColorSwatchPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PALETTE.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`h-7 w-7 rounded-full transition ring-offset-2 ring-offset-[var(--surface)] ${
            value === c ? 'ring-2 ring-[var(--text)] scale-110' : 'hover:scale-105'
          }`}
          style={{ background: c }}
          aria-label={c}
        />
      ))}
    </div>
  )
}
