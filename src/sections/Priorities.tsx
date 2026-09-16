import { AnimatePresence } from 'framer-motion'
import { Plus, Star, Target } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store/useStore'
import { EmptyState } from '../components/EmptyState'
import { TaskRow } from '../components/TaskRow'
import { TaskEditorModal, type TaskDraft } from '../components/TaskEditorModal'
import type { Task } from '../types'
import { CircleProgress } from '../components/CircleProgress'
import { GoogleCalendarCard } from '../components/GoogleCalendarCard'

const RECOMMENDED_LIMIT = 5

export function PrioritiesSection() {
  const tasks = useStore((s) => s.tasks)
  const addTask = useStore((s) => s.addTask)
  const updateTask = useStore((s) => s.updateTask)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)

  const priorities = tasks.filter((t) => t.isTodayPriority)
  const done = priorities.filter((t) => t.completed)
  const pending = priorities.filter((t) => !t.completed)

  function handleSave(draft: TaskDraft) {
    if (editing) {
      updateTask(editing.id, { ...draft, isTodayPriority: true })
      setEditing(null)
    } else {
      addTask({ ...draft, isTodayPriority: true })
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center gap-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 card-shadow">
        <CircleProgress
          progress={priorities.length ? done.length / priorities.length : 0}
          size={80}
          strokeWidth={9}
          label={`${done.length}/${priorities.length || 0}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
            <Target size={16} />
            Focus for today
          </div>
          <p className="mt-1.5 text-xs text-[var(--text-muted)]">
            {priorities.length > RECOMMENDED_LIMIT
              ? `You've picked ${priorities.length} priorities — consider trimming to your top ${RECOMMENDED_LIMIT} for real focus.`
              : `Choose up to ${RECOMMENDED_LIMIT} things that would make today a win. Completing a priority earns bonus points.`}
          </p>
        </div>
      </div>

      <GoogleCalendarCard />

      <button
        onClick={() => {
          setEditing(null)
          setModalOpen(true)
        }}
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] py-3 text-sm font-medium text-[var(--text-muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
      >
        <Plus size={16} />
        Add a top priority
      </button>

      {priorities.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No priorities set for today"
          subtitle="Add your most important tasks here, or star any task from your task list to bring it into focus."
        />
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {[...pending, ...done].map((task) => (
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
        title={editing ? 'Edit priority' : "Add today's priority"}
        forcePriorityToday
      />
    </div>
  )
}
