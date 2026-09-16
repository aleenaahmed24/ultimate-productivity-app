import { AnimatePresence, motion } from 'framer-motion'
import { Check, Flame, Plus, Repeat, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store/useStore'
import { EmptyState } from '../components/EmptyState'
import { Modal } from '../components/Modal'
import { IconPicker } from '../components/IconPicker'
import { ColorSwatchPicker } from '../components/ColorSwatchPicker'
import { getIcon } from '../components/icons'
import { calcHabitStreak, daysAgoKey, todayKey } from '../utils/gamification'
import type { Habit } from '../types'

function last7Days() {
  return Array.from({ length: 7 }, (_, i) => daysAgoKey(6 - i)).map((key) => ({
    key,
    label: new Date(key + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'narrow' }),
  }))
}

function HabitCard({ habit }: { habit: Habit }) {
  const toggleHabitDate = useStore((s) => s.toggleHabitDate)
  const deleteHabit = useStore((s) => s.deleteHabit)
  const Icon = getIcon(habit.icon)
  const { current, best } = calcHabitStreak(habit.completions)
  const today = todayKey()
  const doneToday = !!habit.completions[today]
  const days = last7Days()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 card-shadow"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `${habit.color}22`, color: habit.color }}
          >
            <Icon size={18} />
          </div>
          <div>
            <p className="font-medium text-[var(--text)]">{habit.name}</p>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              {current > 0 && (
                <span className="flex items-center gap-0.5 font-medium text-orange-500">
                  <Flame size={12} /> {current}
                </span>
              )}
              <span>Best {best}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => deleteHabit(habit.id)}
          className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500"
          aria-label="Delete habit"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-1.5">
        {days.map((d) => {
          const isDone = !!habit.completions[d.key]
          const isToday = d.key === today
          return (
            <button
              key={d.key}
              onClick={() => toggleHabitDate(habit.id, d.key)}
              className={`flex h-9 w-9 flex-col items-center justify-center rounded-xl text-[10px] font-semibold transition ${
                isDone ? 'text-white' : 'border border-[var(--border)] text-[var(--text-muted)]'
              } ${isToday && !isDone ? 'ring-2 ring-[var(--primary)]' : ''}`}
              style={isDone ? { background: habit.color } : undefined}
            >
              {isDone ? <Check size={14} /> : d.label}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => toggleHabitDate(habit.id, today)}
        className={`mt-3 w-full rounded-xl py-2 text-sm font-semibold transition ${
          doneToday
            ? 'bg-[var(--surface-2)] text-[var(--text-muted)]'
            : 'text-white'
        }`}
        style={!doneToday ? { background: habit.color } : undefined}
      >
        {doneToday ? "Done for today ✓" : 'Mark done today'}
      </button>
    </motion.div>
  )
}

function AddHabitModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addHabit = useStore((s) => s.addHabit)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [icon, setIcon] = useState('Star')

  function submit() {
    if (!name.trim()) return
    addHabit(name.trim(), color, icon, 'daily')
    setName('')
    setColor('#6366f1')
    setIcon('Star')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New habit">
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="e.g. Meditate, Journal, No sugar"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Color</label>
          <ColorSwatchPicker value={color} onChange={setColor} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Icon</label>
          <IconPicker value={icon} onChange={setIcon} color={color} />
        </div>
        <button
          onClick={submit}
          disabled={!name.trim()}
          className="mt-1 w-full rounded-xl gradient-bg py-2.5 text-sm font-semibold text-white transition disabled:opacity-40"
        >
          Add habit
        </button>
      </div>
    </Modal>
  )
}

export function HabitsSection() {
  const habits = useStore((s) => s.habits)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] py-3 text-sm font-medium text-[var(--text-muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
      >
        <Plus size={16} />
        Add a habit
      </button>

      {habits.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No habits yet"
          subtitle="Track the small daily actions that add up — checking one off earns points and builds your streak."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AnimatePresence>
            {habits.map((h) => (
              <HabitCard key={h.id} habit={h} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AddHabitModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
