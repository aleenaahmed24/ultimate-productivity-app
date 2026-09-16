import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Lock, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { Modal } from '../components/Modal'
import { IconPicker } from '../components/IconPicker'
import { ProgressBar } from '../components/ProgressBar'
import { getIcon } from '../components/icons'
import { getLevelInfo } from '../utils/gamification'
import { BADGE_DEFS } from '../utils/badges'

function AddRewardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addReward = useStore((s) => s.addReward)
  const [title, setTitle] = useState('')
  const [cost, setCost] = useState(100)
  const [icon, setIcon] = useState('Gift')

  function submit() {
    if (!title.trim() || cost <= 0) return
    addReward(title.trim(), cost, icon)
    setTitle('')
    setCost(100)
    setIcon('Gift')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="New reward">
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            What do you want to earn?
          </label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New book, Movie night, Sleep in"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            Cost in points
          </label>
          <input
            type="number"
            min={10}
            step={10}
            value={cost}
            onChange={(e) => setCost(Number(e.target.value))}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Icon</label>
          <IconPicker value={icon} onChange={setIcon} color="var(--primary)" />
        </div>
        <button
          onClick={submit}
          disabled={!title.trim() || cost <= 0}
          className="mt-1 w-full rounded-xl gradient-bg py-2.5 text-sm font-semibold text-white transition disabled:opacity-40"
        >
          Add reward
        </button>
      </div>
    </Modal>
  )
}

export function RewardsSection() {
  const rewards = useStore((s) => s.rewards)
  const deleteReward = useStore((s) => s.deleteReward)
  const redeemReward = useStore((s) => s.redeemReward)
  const totalPointsEarned = useStore((s) => s.totalPointsEarned)
  const spentPoints = useStore((s) => s.spentPoints)
  const pointsLog = useStore((s) => s.pointsLog)
  const redemptions = useStore((s) => s.redemptions)
  const tasks = useStore((s) => s.tasks)
  const habits = useStore((s) => s.habits)

  const [modalOpen, setModalOpen] = useState(false)

  const available = totalPointsEarned - spentPoints
  const level = getLevelInfo(totalPointsEarned)

  const earnedBadges = useMemo(
    () =>
      BADGE_DEFS.filter((b) =>
        b.isEarned({ tasks, habits, totalPointsEarned, redemptionCount: redemptions.length }),
      ),
    [tasks, habits, totalPointsEarned, redemptions.length],
  )

  function handleRedeem(id: string) {
    const ok = redeemReward(id)
    if (ok) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#ec4899', '#6366f1', '#22c55e'],
      })
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 card-shadow sm:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                Level {level.level}
              </p>
              <p className="text-lg font-bold text-[var(--text)]">{level.title}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold gradient-text">{available}</p>
              <p className="text-xs text-[var(--text-muted)]">points available</p>
            </div>
          </div>
          <ProgressBar progress={level.progress} height={10} />
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            {Math.max(level.nextLevelCeiling - totalPointsEarned, 0)} points to level {level.level + 1}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 card-shadow">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
            Lifetime earned
          </p>
          <p className="text-2xl font-bold text-[var(--text)]">{totalPointsEarned}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">{spentPoints} spent so far</p>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text)]">Badges</h3>
          <span className="text-xs text-[var(--text-muted)]">
            {earnedBadges.length}/{BADGE_DEFS.length} earned
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BADGE_DEFS.map((b) => {
            const earned = earnedBadges.some((e) => e.id === b.id)
            const Icon = getIcon(b.icon)
            return (
              <div
                key={b.id}
                className={`flex flex-col items-center rounded-xl border p-3 text-center transition ${
                  earned
                    ? 'border-[var(--primary)] bg-[var(--primary-soft)]'
                    : 'border-[var(--border)] bg-[var(--surface)] opacity-50'
                }`}
              >
                <div
                  className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${
                    earned ? 'gradient-bg text-white' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <p className="text-xs font-semibold text-[var(--text)]">{b.title}</p>
                <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{b.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text)]">Reward store</h3>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1 rounded-lg bg-[var(--primary-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)]"
          >
            <Plus size={14} /> Add reward
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AnimatePresence>
            {rewards.map((r) => {
              const Icon = getIcon(r.icon)
              const affordable = available >= r.cost
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text)]">{r.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">{r.cost} points</p>
                  </div>
                  <button
                    onClick={() => handleRedeem(r.id)}
                    disabled={!affordable}
                    className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      affordable
                        ? 'gradient-bg text-white'
                        : 'cursor-not-allowed bg-[var(--surface-2)] text-[var(--text-muted)]'
                    }`}
                  >
                    {affordable ? 'Redeem' : <Lock size={12} />}
                  </button>
                  <button
                    onClick={() => deleteReward(r.id)}
                    className="shrink-0 rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500"
                    aria-label="Delete reward"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {(pointsLog.length > 0 || redemptions.length > 0) && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[var(--text)]">Recent activity</h3>
          <div className="flex flex-col gap-2">
            {[
              ...pointsLog.slice(0, 8).map((p) => ({
                id: p.id,
                label: p.reason,
                value: `+${p.amount}`,
                positive: true,
                timestamp: p.timestamp,
              })),
              ...redemptions.slice(0, 8).map((r) => ({
                id: r.id,
                label: `Redeemed ${r.rewardTitle}`,
                value: `-${r.cost}`,
                positive: false,
                timestamp: r.timestamp,
              })),
            ]
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 8)
              .map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-[var(--surface-2)]"
                >
                  <span className="text-[var(--text)]">{entry.label}</span>
                  <span
                    className={`font-semibold ${
                      entry.positive ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {entry.value}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      <AddRewardModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
