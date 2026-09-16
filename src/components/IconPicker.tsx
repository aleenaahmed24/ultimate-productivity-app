import { ICON_NAMES, getIcon } from './icons'

export function IconPicker({
  value,
  onChange,
  color,
}: {
  value: string
  onChange: (icon: string) => void
  color?: string
}) {
  return (
    <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto p-1">
      {ICON_NAMES.map((name) => {
        const Icon = getIcon(name)
        const active = name === value
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            className={`flex items-center justify-center rounded-lg border p-2 transition ${
              active
                ? 'border-[var(--primary)] bg-[var(--primary-soft)]'
                : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
            }`}
            aria-label={name}
          >
            <Icon size={16} color={active ? color : 'var(--text-muted)'} />
          </button>
        )
      })}
    </div>
  )
}
