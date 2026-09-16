import type { LucideIcon } from 'lucide-react'

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] px-6 py-14 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-2)]">
        <Icon size={26} className="text-[var(--text-muted)]" />
      </div>
      <p className="font-medium text-[var(--text)]">{title}</p>
      {subtitle && <p className="mt-1 max-w-xs text-sm text-[var(--text-muted)]">{subtitle}</p>}
    </div>
  )
}
