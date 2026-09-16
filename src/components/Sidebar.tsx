import {
  Brain,
  LayoutDashboard,
  ListChecks,
  Repeat,
  Settings as SettingsIcon,
  Star,
  Trophy,
} from 'lucide-react'
import type { SectionId } from '../types'
import { useStore } from '../store/useStore'
import { getLevelInfo } from '../utils/gamification'

const NAV: { id: SectionId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'braindump', label: 'Brain Dump', icon: Brain },
  { id: 'priorities', label: "Today's Priorities", icon: Star },
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'habits', label: 'Habits', icon: Repeat },
  { id: 'rewards', label: 'Rewards', icon: Trophy },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

export function Sidebar({
  active,
  onChange,
}: {
  active: SectionId
  onChange: (s: SectionId) => void
}) {
  const totalPointsEarned = useStore((s) => s.totalPointsEarned)
  const level = getLevelInfo(totalPointsEarned)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-bg text-white font-bold">
            S
          </div>
          <div>
            <p className="font-semibold leading-tight text-[var(--text)]">Summit</p>
            <p className="text-xs text-[var(--text-muted)]">Level {level.level} · {level.title}</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'gradient-bg text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="rounded-xl bg-[var(--surface-2)] px-3 py-3 text-xs text-[var(--text-muted)]">
          Your data stays on this device — stored locally in your browser.
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-[var(--border)] bg-[var(--bg-elevated)]/95 backdrop-blur px-1 pt-2 md:hidden"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        {NAV.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-medium ${
                isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
              }`}
            >
              <Icon size={18} />
              {item.label.split(' ')[0]}
            </button>
          )
        })}
      </nav>
    </>
  )
}
