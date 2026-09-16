import { AnimatePresence, motion } from 'framer-motion'
import { Brain, Sparkles, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store/useStore'
import { EmptyState } from '../components/EmptyState'
import { TaskEditorModal, type TaskDraft } from '../components/TaskEditorModal'

export function BrainDumpSection() {
  const brainDump = useStore((s) => s.brainDump)
  const addBrainDumpItem = useStore((s) => s.addBrainDumpItem)
  const deleteBrainDumpItem = useStore((s) => s.deleteBrainDumpItem)
  const convertBrainDumpToTask = useStore((s) => s.convertBrainDumpToTask)
  const clearBrainDump = useStore((s) => s.clearBrainDump)

  const [text, setText] = useState('')
  const [convertingId, setConvertingId] = useState<string | null>(null)

  function submit() {
    const trimmed = text.trim()
    if (!trimmed) return
    addBrainDumpItem(trimmed)
    setText('')
  }

  function saveAsTask(draft: TaskDraft) {
    if (!convertingId) return
    convertBrainDumpToTask(convertingId, draft)
    setConvertingId(null)
  }

  const convertingItem = brainDump.find((b) => b.id === convertingId)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 card-shadow">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
          <Brain size={16} />
          Get it out of your head
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
          }}
          placeholder="Type anything on your mind — an idea, a worry, a random task. Don't organize it, just dump it. (Cmd/Ctrl + Enter to save)"
          rows={3}
          className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="rounded-xl gradient-bg px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-40"
          >
            Dump it
          </button>
        </div>
      </div>

      {brainDump.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Your head is clear"
          subtitle="Whatever's on your mind, drop it above. You can organize it into real tasks whenever you're ready."
        />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-muted)]">
              {brainDump.length} item{brainDump.length === 1 ? '' : 's'} waiting to be sorted
            </p>
            <button
              onClick={clearBrainDump}
              className="text-xs font-medium text-[var(--text-muted)] hover:text-red-500"
            >
              Clear all
            </button>
          </div>
          <AnimatePresence initial={false}>
            {brainDump.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5"
              >
                <p className="flex-1 text-sm text-[var(--text)]">{item.text}</p>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => setConvertingId(item.id)}
                    className="rounded-lg bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--primary)] hover:opacity-80"
                  >
                    Make a task
                  </button>
                  <button
                    onClick={() => deleteBrainDumpItem(item.id)}
                    className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <TaskEditorModal
        open={!!convertingId}
        onClose={() => setConvertingId(null)}
        onSave={saveAsTask}
        title="Turn into a task"
        initial={{ title: convertingItem?.text }}
      />
    </div>
  )
}
