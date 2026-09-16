import { useEffect, useState } from 'react'
import type { Priority, Task } from '../types'
import { useStore } from '../store/useStore'
import { Modal } from './Modal'
import { getIcon } from './icons'

const PRIORITIES: { id: Priority; label: string; color: string }[] = [
  { id: 'low', label: 'Low', color: '#0ea5e9' },
  { id: 'medium', label: 'Medium', color: '#f59e0b' },
  { id: 'high', label: 'High', color: '#ef4444' },
]

export interface TaskDraft {
  title: string
  notes?: string
  categoryId: string | null
  priority: Priority
  dueDate?: string | null
  isTodayPriority?: boolean
}

export function TaskEditorModal({
  open,
  onClose,
  onSave,
  initial,
  title = 'New Task',
  forcePriorityToday,
}: {
  open: boolean
  onClose: () => void
  onSave: (draft: TaskDraft) => void
  initial?: Partial<Task>
  title?: string
  forcePriorityToday?: boolean
}) {
  const categories = useStore((s) => s.categories)
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    if (open) {
      setName(initial?.title ?? '')
      setNotes(initial?.notes ?? '')
      setCategoryId(initial?.categoryId ?? categories[0]?.id ?? null)
      setPriority(initial?.priority ?? 'medium')
      setDueDate(initial?.dueDate ?? '')
    }
    // Only re-seed the form when the modal transitions open; `initial` is
    // recreated on every parent render and must not reset in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function submit() {
    if (!name.trim()) return
    onSave({
      title: name.trim(),
      notes: notes.trim() || undefined,
      categoryId,
      priority,
      dueDate: dueDate || null,
      isTodayPriority: forcePriorityToday,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Title</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="What needs to get done?"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Any extra detail..."
            className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryId(null)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                categoryId === null
                  ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
              }`}
            >
              None
            </button>
            {categories.map((c) => {
              const Icon = getIcon(c.icon)
              const active = categoryId === c.id
              return (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition"
                  style={
                    active
                      ? { background: c.color, borderColor: c.color, color: 'white' }
                      : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
                  }
                >
                  <Icon size={12} />
                  {c.name}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
            Priority
          </label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPriority(p.id)}
                className="flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition"
                style={
                  priority === p.id
                    ? { background: p.color, borderColor: p.color, color: 'white' }
                    : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            Due date (optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
          />
        </div>

        <button
          onClick={submit}
          disabled={!name.trim()}
          className="mt-1 w-full rounded-xl gradient-bg py-2.5 text-sm font-semibold text-white transition disabled:opacity-40"
        >
          Save task
        </button>
      </div>
    </Modal>
  )
}
