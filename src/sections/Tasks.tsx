import { AnimatePresence } from 'framer-motion'
import { ListChecks, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { EmptyState } from '../components/EmptyState'
import { TaskRow } from '../components/TaskRow'
import { TaskEditorModal, type TaskDraft } from '../components/TaskEditorModal'
import { getIcon } from '../components/icons'
import type { Task } from '../types'

type StatusFilter = 'active' | 'completed' | 'all'

export function TasksSection() {
  const tasks = useStore((s) => s.tasks)
  const categories = useStore((s) => s.categories)
  const addTask = useStore((s) => s.addTask)
  const updateTask = useStore((s) => s.updateTask)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string | 'all' | 'none'>('all')
  const [status, setStatus] = useState<StatusFilter>('active')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => {
        if (status === 'active' && t.completed) return false
        if (status === 'completed' && !t.completed) return false
        if (categoryFilter === 'none' && t.categoryId !== null) return false
        if (categoryFilter !== 'all' && categoryFilter !== 'none' && t.categoryId !== categoryFilter)
          return false
        if (query && !t.title.toLowerCase().includes(query.toLowerCase())) return false
        return true
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        const order = { high: 0, medium: 1, low: 2 }
        if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority]
        return b.createdAt - a.createdAt
      })
  }, [tasks, status, categoryFilter, query])

  function handleSave(draft: TaskDraft) {
    if (editing) {
      updateTask(editing.id, draft)
      setEditing(null)
    } else {
      addTask(draft)
    }
  }

  const counts = useMemo(() => {
    const byCategory: Record<string, number> = {}
    let none = 0
    for (const t of tasks) {
      if (t.completed) continue
      if (t.categoryId) byCategory[t.categoryId] = (byCategory[t.categoryId] ?? 0) + 1
      else none++
    }
    return { byCategory, none }
  }, [tasks])

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div className="flex rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 text-xs font-medium">
          {(['active', 'completed', 'all'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-lg px-3 py-1.5 capitalize transition ${
                status === s ? 'gradient-bg text-white' : 'text-[var(--text-muted)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
          className="flex items-center gap-1.5 rounded-xl gradient-bg px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={16} />
          New task
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            categoryFilter === 'all'
              ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
              : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
          }`}
        >
          All
        </button>
        {categories.map((c) => {
          const Icon = getIcon(c.icon)
          const active = categoryFilter === c.id
          return (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition"
              style={
                active
                  ? { background: c.color, borderColor: c.color, color: 'white' }
                  : { borderColor: 'var(--border)', color: 'var(--text-muted)' }
              }
            >
              <Icon size={12} />
              {c.name}
              {!!counts.byCategory[c.id] && (
                <span className="opacity-70">· {counts.byCategory[c.id]}</span>
              )}
            </button>
          )
        })}
        <button
          onClick={() => setCategoryFilter('none')}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            categoryFilter === 'none'
              ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
              : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
          }`}
        >
          Uncategorized{counts.none ? ` · ${counts.none}` : ''}
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title={status === 'completed' ? 'Nothing completed yet' : 'All clear'}
          subtitle={
            status === 'completed'
              ? 'Finish a task and it will show up here.'
              : 'No tasks match your filters. Add one to get started.'
          }
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {filtered.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onEdit={(t) => {
                  setEditing(t)
                  setModalOpen(true)
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <TaskEditorModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        onSave={handleSave}
        initial={editing ?? undefined}
        title={editing ? 'Edit task' : 'New task'}
      />
    </div>
  )
}
