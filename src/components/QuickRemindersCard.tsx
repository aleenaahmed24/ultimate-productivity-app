import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Check, Clock, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store/useStore'

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function QuickRemindersCard() {
  const reminders = useStore((s) => s.reminders)
  const addReminder = useStore((s) => s.addReminder)
  const toggleReminder = useStore((s) => s.toggleReminder)
  const deleteReminder = useStore((s) => s.deleteReminder)

  const [text, setText] = useState('')
  const [time, setTime] = useState('')
  const [showTimeInput, setShowTimeInput] = useState(false)

  function submit() {
    const trimmed = text.trim()
    if (!trimmed) return
    addReminder(trimmed, time || null)
    setText('')
    setTime('')
    setShowTimeInput(false)
  }

  const pending = [...reminders]
    .filter((r) => !r.done)
    .sort((a, b) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99'))
  const done = reminders.filter((r) => r.done)

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 card-shadow">
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
        <Bell size={16} className="text-[var(--primary)]" />
        Quick reminders
      </div>

      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Remind me to..."
          className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
        />
        <button
          onClick={() => setShowTimeInput((v) => !v)}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
            showTimeInput || time
              ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]'
              : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
          }`}
          aria-label="Set a time"
        >
          <Clock size={15} />
        </button>
        <button
          onClick={submit}
          disabled={!text.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-bg text-white disabled:opacity-40"
          aria-label="Add reminder"
        >
          <Plus size={16} />
        </button>
      </div>

      {showTimeInput && (
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
          />
          {time && (
            <button
              onClick={() => setTime('')}
              className="rounded-lg p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
              aria-label="Clear time"
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {reminders.length === 0 ? (
        <p className="py-3 text-center text-sm text-[var(--text-muted)]">
          Nothing on your mind right now.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          <AnimatePresence initial={false}>
            {pending.map((r) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-[var(--surface-2)]"
              >
                <button
                  onClick={() => toggleReminder(r.id)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[var(--border)] hover:border-[var(--primary)]"
                  aria-label="Mark reminder done"
                >
                  <Check size={11} strokeWidth={3} className="opacity-0 group-hover:opacity-40" />
                </button>
                <span className="min-w-0 flex-1 truncate text-sm text-[var(--text)]">{r.text}</span>
                {r.time && (
                  <span className="shrink-0 text-xs font-medium text-[var(--text-muted)]">
                    {formatTime(r.time)}
                  </span>
                )}
                <button
                  onClick={() => deleteReminder(r.id)}
                  className="shrink-0 rounded-lg p-1 text-[var(--text-muted)] opacity-0 hover:text-red-500 group-hover:opacity-100"
                  aria-label="Delete reminder"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {done.length > 0 && (
            <div className="mt-1 flex flex-col gap-1.5 border-t border-[var(--border)] pt-1.5">
              {done.map((r) => (
                <div
                  key={r.id}
                  className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 opacity-50 hover:bg-[var(--surface-2)]"
                >
                  <button
                    onClick={() => toggleReminder(r.id)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white"
                    aria-label="Mark reminder not done"
                  >
                    <Check size={11} strokeWidth={3} />
                  </button>
                  <span className="min-w-0 flex-1 truncate text-sm text-[var(--text)] line-through">
                    {r.text}
                  </span>
                  <button
                    onClick={() => deleteReminder(r.id)}
                    className="shrink-0 rounded-lg p-1 text-[var(--text-muted)] opacity-0 hover:text-red-500 group-hover:opacity-100"
                    aria-label="Delete reminder"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
