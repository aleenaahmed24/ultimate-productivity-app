import { AnimatePresence, motion } from 'framer-motion'
import { Check, Moon, Plus, Sun, Trash2, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { Modal } from '../components/Modal'
import { IconPicker } from '../components/IconPicker'
import { ColorSwatchPicker } from '../components/ColorSwatchPicker'
import { getIcon } from '../components/icons'
import type { FontId, ThemeId } from '../types'

const THEMES: { id: ThemeId; label: string; colors: string[] }[] = [
  { id: 'aurora', label: 'Aurora', colors: ['#6366f1', '#8b5cf6', '#06b6d4'] },
  { id: 'sunset', label: 'Sunset', colors: ['#f97316', '#f43f5e', '#ec4899'] },
  { id: 'ocean', label: 'Ocean', colors: ['#0ea5e9', '#06b6d4', '#14b8a6'] },
  { id: 'forest', label: 'Forest', colors: ['#16a34a', '#65a30d', '#84cc16'] },
  { id: 'berry', label: 'Berry', colors: ['#a855f7', '#d946ef', '#ec4899'] },
  { id: 'mono', label: 'Mono', colors: ['#3f3f46', '#52525b', '#71717a'] },
  { id: 'candy', label: 'Candy', colors: ['#f472b6', '#fb7185', '#38bdf8'] },
  { id: 'midnight', label: 'Midnight', colors: ['#4f46e5', '#7c3aed', '#2563eb'] },
]

const FONTS: { id: FontId; label: string; family: string }[] = [
  { id: 'inter', label: 'Inter', family: "'Inter', sans-serif" },
  { id: 'poppins', label: 'Poppins', family: "'Poppins', sans-serif" },
  { id: 'lora', label: 'Lora', family: "'Lora', serif" },
  { id: 'space-grotesk', label: 'Space Grotesk', family: "'Space Grotesk', sans-serif" },
  { id: 'fira-code', label: 'Fira Code', family: "'Fira Code', monospace" },
  { id: 'quicksand', label: 'Quicksand', family: "'Quicksand', sans-serif" },
]

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 card-shadow">
      <h3 className="mb-4 text-sm font-semibold text-[var(--text)]">{title}</h3>
      {children}
    </div>
  )
}

function CategoryModal({
  open,
  onClose,
  editId,
}: {
  open: boolean
  onClose: () => void
  editId: string | null
}) {
  const categories = useStore((s) => s.categories)
  const addCategory = useStore((s) => s.addCategory)
  const updateCategory = useStore((s) => s.updateCategory)
  const editing = categories.find((c) => c.id === editId) ?? null

  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')
  const [icon, setIcon] = useState('Star')

  useEffect(() => {
    if (!open) return
    if (editing) {
      setName(editing.name)
      setColor(editing.color)
      setIcon(editing.icon)
    } else {
      setName('')
      setColor('#6366f1')
      setIcon('Star')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editId])

  function submit() {
    if (!name.trim()) return
    if (editing) {
      updateCategory(editing.id, { name: name.trim(), color, icon })
    } else {
      addCategory(name.trim(), color, icon)
    }
    setName('')
    setColor('#6366f1')
    setIcon('Star')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit category' : 'New category'}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Name</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="e.g. Finance, Side project"
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
          {editing ? 'Save changes' : 'Add category'}
        </button>
      </div>
    </Modal>
  )
}

export function SettingsSection() {
  const settings = useStore((s) => s.settings)
  const setTheme = useStore((s) => s.setTheme)
  const setFont = useStore((s) => s.setFont)
  const toggleDarkMode = useStore((s) => s.toggleDarkMode)
  const categories = useStore((s) => s.categories)
  const deleteCategory = useStore((s) => s.deleteCategory)

  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  function resetData() {
    localStorage.removeItem('ultimate-productivity-app')
    window.location.reload()
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <SettingsCard title="Appearance mode">
        <div className="flex gap-3">
          <button
            onClick={() => settings.darkMode && toggleDarkMode()}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition ${
              !settings.darkMode
                ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]'
                : 'border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            <Sun size={16} /> Light
          </button>
          <button
            onClick={() => !settings.darkMode && toggleDarkMode()}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition ${
              settings.darkMode
                ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]'
                : 'border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            <Moon size={16} /> Dark
          </button>
        </div>
      </SettingsCard>

      <SettingsCard title="Color scheme">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {THEMES.map((t) => {
            const active = settings.theme === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`relative flex flex-col items-center gap-2 rounded-xl border p-3 transition ${
                  active ? 'border-[var(--text)]' : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
                }`}
              >
                {active && (
                  <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--text)] text-[var(--bg)]">
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
                <div
                  className="h-9 w-9 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]}, ${t.colors[2]})`,
                  }}
                />
                <span className="text-xs font-medium text-[var(--text)]">{t.label}</span>
              </button>
            )
          })}
        </div>
      </SettingsCard>

      <SettingsCard title="Font">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {FONTS.map((f) => {
            const active = settings.font === f.id
            return (
              <button
                key={f.id}
                onClick={() => setFont(f.id)}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${
                  active
                    ? 'border-[var(--primary)] bg-[var(--primary-soft)]'
                    : 'border-[var(--border)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <span
                  className={active ? 'text-[var(--primary)]' : 'text-[var(--text)]'}
                  style={{ fontFamily: f.family }}
                >
                  Aa — {f.label}
                </span>
                {active && <Check size={16} className="text-[var(--primary)]" />}
              </button>
            )
          })}
        </div>
      </SettingsCard>

      <SettingsCard title="Categories">
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {categories.map((c) => {
              const Icon = getIcon(c.icon)
              return (
                <motion.div
                  layout
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] px-3 py-2.5"
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: `${c.color}22`, color: c.color }}
                  >
                    <Icon size={15} />
                  </div>
                  <span className="flex-1 text-sm font-medium text-[var(--text)]">{c.name}</span>
                  <button
                    onClick={() => {
                      setEditId(c.id)
                      setCategoryModalOpen(true)
                    }}
                    className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(c.id)}
                    className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500"
                    aria-label="Delete category"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
          <button
            onClick={() => {
              setEditId(null)
              setCategoryModalOpen(true)
            }}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] py-2.5 text-sm font-medium text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <Plus size={15} /> Add category
          </button>
        </div>
      </SettingsCard>

      <SettingsCard title="Data">
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10"
          >
            Reset all data
          </button>
        ) : (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-red-500">
              <TriangleAlert size={16} /> This deletes everything, permanently.
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetData}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white"
              >
                Yes, reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </SettingsCard>

      <CategoryModal
        open={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false)
          setEditId(null)
        }}
        editId={editId}
      />
    </div>
  )
}
