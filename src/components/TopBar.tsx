import { Flame, Moon, Sun } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getLevelInfo, calcHabitStreak } from '../utils/gamification'
import { ProgressBar } from './ProgressBar'
import type { SectionId } from '../types'

const TITLES: Record<SectionId, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Your day at a glance' },
  braindump: { title: 'Brain Dump', subtitle: 'Empty your head, sort it later' },
  priorities: { title: "Today's Priorities", subtitle: 'What matters most, right now' },
  tasks: { title: 'Tasks', subtitle: 'Everything on your plate, organized' },
  habits: { title: 'Habits', subtitle: 'Small actions, tracked daily' },
  rewards: { title: 'Rewards', subtitle: 'Cash in the points you earned' },
  settings: { title: 'Settings', subtitle: 'Make it yours' },
}

export function TopBar({ section }: { section: SectionId }) {
  const totalPointsEarned = useStore((s) => s.totalPointsEarned)
  const spentPoints = useStore((s) => s.spentPoints)
  const habits = useStore((s) => s.habits)
  const darkMode = useStore((s) => s.settings.darkMode)
  const toggleDarkMode = useStore((s) => s.toggleDarkMode)

  const level = getLevelInfo(totalPointsEarned)
  const available = totalPointsEarned - spentPoints
  const bestStreak = habits.reduce(
    (max, h) => Math.max(max, calcHabitStreak(h.completions).current),
    0,
  )
  const copy = TITLES[section]

  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur px-4 py-4 sm:px-8"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text)] sm:text-2xl">{copy.title}</h1>
          <p className="text-sm text-[var(--text-muted)]">{copy.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {bestStreak > 0 && (
            <div className="hidden items-center gap-1.5 rounded-full bg-[var(--surface-2)] px-3 py-1.5 text-sm font-medium text-[var(--text)] sm:flex">
              <Flame size={16} className="text-orange-500" />
              {bestStreak} day streak
            </div>
          )}

          <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5">
            <div className="w-28">
              <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                <span>Lvl {level.level}</span>
                <span>{available} pts</span>
              </div>
              <ProgressBar progress={level.progress} height={6} />
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  )
}
