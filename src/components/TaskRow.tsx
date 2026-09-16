import { motion } from 'framer-motion'
import { Check, Pencil, Star, Trash2 } from 'lucide-react'
import type { Task } from '../types'
import { useStore } from '../store/useStore'
import { getIcon } from './icons'

const PRIORITY_COLOR: Record<Task['priority'], string> = {
  low: '#0ea5e9',
  medium: '#f59e0b',
  high: '#ef4444',
}

export function TaskRow({
  task,
  onEdit,
  showPriorityToggle = true,
}: {
  task: Task
  onEdit?: (task: Task) => void
  showPriorityToggle?: boolean
}) {
  const categories = useStore((s) => s.categories)
  const toggleTaskComplete = useStore((s) => s.toggleTaskComplete)
  const togglePriority = useStore((s) => s.togglePriority)
  const deleteTask = useStore((s) => s.deleteTask)

  const category = categories.find((c) => c.id === task.categoryId)
  const CategoryIcon = category ? getIcon(category.icon) : null

  const isOverdue =
    !task.completed && task.dueDate && new Date(task.dueDate + 'T23:59:59') < new Date()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`group flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 transition ${
        task.completed ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={() => toggleTaskComplete(task.id)}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
          task.completed
            ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
            : 'border-[var(--border)] hover:border-[var(--primary)]'
        }`}
        aria-label="Toggle complete"
      >
        {task.completed && <Check size={12} strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium text-[var(--text)] ${
            task.completed ? 'line-through' : ''
          }`}
        >
          {task.title}
        </p>
        {task.notes && (
          <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">{task.notes}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ background: `${PRIORITY_COLOR[task.priority]}22`, color: PRIORITY_COLOR[task.priority] }}
          >
            {task.priority}
          </span>
          {category && CategoryIcon && (
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: `${category.color}1f`, color: category.color }}
            >
              <CategoryIcon size={10} />
              {category.name}
            </span>
          )}
          {task.dueDate && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isOverdue
                  ? 'bg-red-500/15 text-red-500'
                  : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
              }`}
            >
              {new Date(task.dueDate + 'T00:00:00').toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        {showPriorityToggle && (
          <button
            onClick={() => togglePriority(task.id)}
            className={`rounded-lg p-1.5 hover:bg-[var(--surface-2)] ${
              task.isTodayPriority ? 'text-amber-500' : 'text-[var(--text-muted)]'
            }`}
            aria-label="Toggle today priority"
          >
            <Star size={14} fill={task.isTodayPriority ? 'currentColor' : 'none'} />
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            aria-label="Edit task"
          >
            <Pencil size={14} />
          </button>
        )}
        <button
          onClick={() => deleteTask(task.id)}
          className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500"
          aria-label="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  )
}
