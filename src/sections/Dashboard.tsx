import { Brain, ChevronRight, Flame, ListChecks, Repeat, Star, Trophy } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import confetti from 'canvas-confetti'
import { useStore } from '../store/useStore'
import { getLevelInfo, calcHabitStreak, todayKey } from '../utils/gamification'
import { ProgressBar } from '../components/ProgressBar'
import { DailyBlocksRing, type RingBlock } from '../components/DailyBlocksRing'
import { TaskRow } from '../components/TaskRow'
import { getIcon } from '../components/icons'
import { GoogleCalendarCard } from '../components/GoogleCalendarCard'
import { QuickRemindersCard } from '../components/QuickRemindersCard'
import type { SectionId } from '../types'

function dailyProgressMessage(pct: number, total: number) {
  if (total === 0) return 'Add a priority, habit, or due-today task to fill in your board.'
  if (pct >= 1) return "Everything for today is done. Nice work!"
  if (pct === 0) return "Nothing checked off yet — let's get moving."
  if (pct >= 0.75) return 'Almost there — just a bit more.'
  if (pct >= 0.5) return "Halfway there — keep it going."
  return "You've got this. One block at a time."
}

export function Dashboard({ onNavigate }: { onNavigate: (s: SectionId) => void }) {
  const tasks = useStore((s) => s.tasks)
  const habits = useStore((s) => s.habits)
  const brainDump = useStore((s) => s.brainDump)
  const totalPointsEarned = useStore((s) => s.totalPointsEarned)
  const spentPoints = useStore((s) => s.spentPoints)

  const level = getLevelInfo(totalPointsEarned)
  const available = totalPointsEarned - spentPoints
  const priorities = tasks.filter((t) => t.isTodayPriority)
  const priorityDone = priorities.filter((t) => t.completed).length
  const today = todayKey()
  const habitsRemaining = habits.filter((h) => !h.completions[today])
  const activeTasks = tasks.filter((t) => !t.completed)

  const dueTodayTasks = useMemo(
    () => tasks.filter((t) => !t.isTodayPriority && t.dueDate === today),
    [tasks, today],
  )

  const blocks: RingBlock[] = useMemo(
    () => [
      ...priorities.map((t) => ({
        id: `priority-${t.id}`,
        done: t.completed,
        colorDone: 'var(--primary)',
        colorMuted: 'var(--primary-soft)',
      })),
      ...dueTodayTasks.map((t) => ({
        id: `task-${t.id}`,
        done: t.completed,
        colorDone: 'var(--accent)',
        colorMuted: 'var(--accent-soft)',
      })),
      ...habits.map((h) => ({
        id: `habit-${h.id}`,
        done: !!h.completions[today],
        colorDone: h.color,
        colorMuted: `${h.color}33`,
      })),
    ],
    [priorities, dueTodayTasks, habits, today],
  )
  const blocksDone = blocks.filter((b) => b.done).length
  const dailyProgress = blocks.length ? blocksDone / blocks.length : 0

  const celebratedRef = useRef(false)
  useEffect(() => {
    if (blocks.length > 0 && dailyProgress >= 1 && !celebratedRef.current) {
      celebratedRef.current = true
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.4 },
        colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#ec4899', '#22c55e'],
      })
    } else if (dailyProgress < 1) {
      celebratedRef.current = false
    }
  }, [dailyProgress, blocks.length])

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 card-shadow sm:flex-row sm:items-center">
        <DailyBlocksRing blocks={blocks} />
        <div className="flex flex-1 flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Today's board
            </p>
            <p className="mt-1 text-lg font-bold text-[var(--text)]">
              {dailyProgressMessage(dailyProgress, blocks.length)}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {blocksDone}/{blocks.length} blocks done across priorities, habits, and today's tasks.
            </p>
          </div>

          <div className="flex shrink-0 flex-row gap-4 sm:flex-col sm:gap-2">
            <LegendRow
              icon={Star}
              label="Priorities"
              done={priorities.filter((p) => p.completed).length}
              total={priorities.length}
              color="var(--primary)"
              bg="var(--primary-soft)"
              onClick={() => onNavigate('priorities')}
            />
            <LegendRow
              icon={Repeat}
              label="Habits"
              done={habits.filter((h) => !!h.completions[today]).length}
              total={habits.length}
              color="#22c55e"
              bg="#22c55e22"
              onClick={() => onNavigate('habits')}
            />
            <LegendRow
              icon={ListChecks}
              label="Due today"
              done={dueTodayTasks.filter((t) => t.completed).length}
              total={dueTodayTasks.length}
              color="var(--accent)"
              bg="var(--accent-soft)"
              onClick={() => onNavigate('tasks')}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          icon={Trophy}
          label="Level"
          value={`${level.level}`}
          sub={level.title}
          onClick={() => onNavigate('rewards')}
        />
        <StatCard
          icon={Star}
          label="Points available"
          value={`${available}`}
          sub={`${totalPointsEarned} lifetime`}
          onClick={() => onNavigate('rewards')}
        />
        <StatCard
          icon={Star}
          label="Today's priorities"
          value={`${priorityDone}/${priorities.length}`}
          sub={priorities.length ? 'in progress' : 'none set'}
          onClick={() => onNavigate('priorities')}
        />
        <StatCard
          icon={Flame}
          label="Best habit streak"
          value={`${habits.reduce((m, h) => Math.max(m, calcHabitStreak(h.completions).current), 0)}`}
          sub="days"
          onClick={() => onNavigate('habits')}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 card-shadow lg:col-span-2">
          <SectionHeader
            icon={Star}
            title="Today's priorities"
            onClick={() => onNavigate('priorities')}
          />
          <ProgressBar progress={priorities.length ? priorityDone / priorities.length : 0} />
          {priorities.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--text-muted)]">
              Nothing set yet — pick your top focus items for today.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {priorities.slice(0, 4).map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 card-shadow">
          <SectionHeader icon={Repeat} title="Habits left today" onClick={() => onNavigate('habits')} />
          {habitsRemaining.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--text-muted)]">
              {habits.length === 0 ? 'No habits yet.' : 'All done for today. Nice work!'}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {habitsRemaining.map((h) => {
                const Icon = getIcon(h.icon)
                return (
                  <div
                    key={h.id}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-[var(--text)]"
                  >
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{ background: `${h.color}22`, color: h.color }}
                    >
                      <Icon size={13} />
                    </div>
                    {h.name}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <QuickRemindersCard />
        <GoogleCalendarCard />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 card-shadow">
          <SectionHeader icon={ListChecks} title="Active tasks" onClick={() => onNavigate('tasks')} />
          <p className="text-3xl font-bold text-[var(--text)]">{activeTasks.length}</p>
          <p className="text-sm text-[var(--text-muted)]">tasks left to complete</p>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 card-shadow">
          <SectionHeader icon={Brain} title="Brain dump" onClick={() => onNavigate('braindump')} />
          <p className="text-3xl font-bold text-[var(--text)]">{brainDump.length}</p>
          <p className="text-sm text-[var(--text-muted)]">unsorted items waiting</p>
        </div>
      </div>
    </div>
  )
}

function LegendRow({
  icon: Icon,
  label,
  done,
  total,
  color,
  bg,
  onClick,
}: {
  icon: typeof Star
  label: string
  done: number
  total: number
  color: string
  bg: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg px-2 py-1 text-left hover:bg-[var(--surface-2)]"
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
        style={{ background: bg, color }}
      >
        <Icon size={12} />
      </span>
      <span className="text-xs font-medium text-[var(--text)]">{label}</span>
      <span className="text-xs text-[var(--text-muted)]">
        {done}/{total}
      </span>
    </button>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  onClick,
}: {
  icon: typeof Trophy
  label: string
  value: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left card-shadow transition hover:-translate-y-0.5"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg text-white">
        <Icon size={15} />
      </div>
      <p className="text-xs font-medium text-[var(--text-muted)]">{label}</p>
      <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
      <p className="text-xs text-[var(--text-muted)]">{sub}</p>
    </button>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  onClick,
}: {
  icon: typeof Star
  title: string
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="flex items-center justify-between text-left">
      <span className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
        <Icon size={15} className="text-[var(--primary)]" />
        {title}
      </span>
      <ChevronRight size={15} className="text-[var(--text-muted)]" />
    </button>
  )
}
