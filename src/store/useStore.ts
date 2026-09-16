import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  BrainDumpItem,
  Category,
  FontId,
  Habit,
  Priority,
  PointsLogEntry,
  RedemptionLogEntry,
  Reminder,
  Reward,
  Settings,
  Task,
  ThemeId,
} from '../types'
import {
  BRAIN_DUMP_CONVERT_POINTS,
  HABIT_BASE_POINTS,
  REMINDER_POINTS,
  TASK_POINTS,
  TODAY_PRIORITY_BONUS,
  calcHabitStreak,
  habitStreakBonus,
  todayKey,
} from '../utils/gamification'

const uid = () => crypto.randomUUID()

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: '#6366f1', icon: 'Briefcase' },
  { id: 'personal', name: 'Personal', color: '#ec4899', icon: 'Heart' },
  { id: 'health', name: 'Health', color: '#22c55e', icon: 'HeartPulse' },
  { id: 'learning', name: 'Learning', color: '#f59e0b', icon: 'BookOpen' },
  { id: 'errands', name: 'Errands', color: '#06b6d4', icon: 'ShoppingCart' },
]

const DEFAULT_HABITS: Habit[] = [
  {
    id: uid(),
    name: 'Drink water',
    color: '#06b6d4',
    icon: 'Droplet',
    frequency: 'daily',
    customDays: [],
    completions: {},
    createdAt: Date.now(),
  },
  {
    id: uid(),
    name: 'Move your body',
    color: '#22c55e',
    icon: 'Dumbbell',
    frequency: 'daily',
    customDays: [],
    completions: {},
    createdAt: Date.now(),
  },
  {
    id: uid(),
    name: 'Read 10 minutes',
    color: '#f59e0b',
    icon: 'BookOpen',
    frequency: 'daily',
    customDays: [],
    completions: {},
    createdAt: Date.now(),
  },
]

const DEFAULT_REWARDS: Reward[] = [
  { id: uid(), title: '15-minute break', cost: 50, icon: 'Coffee', createdAt: Date.now() },
  { id: uid(), title: 'Watch an episode', cost: 150, icon: 'Tv', createdAt: Date.now() },
  { id: uid(), title: 'Order takeout', cost: 300, icon: 'Utensils', createdAt: Date.now() },
  { id: uid(), title: 'Buy something small', cost: 500, icon: 'Gift', createdAt: Date.now() },
]

interface StoreState {
  categories: Category[]
  tasks: Task[]
  brainDump: BrainDumpItem[]
  habits: Habit[]
  reminders: Reminder[]
  rewards: Reward[]
  pointsLog: PointsLogEntry[]
  redemptions: RedemptionLogEntry[]
  totalPointsEarned: number
  spentPoints: number
  settings: Settings
  lastCelebration: { id: string; points: number; reason: string } | null

  // categories
  addCategory: (name: string, color: string, icon: string) => void
  updateCategory: (id: string, patch: Partial<Category>) => void
  deleteCategory: (id: string) => void

  // tasks
  addTask: (input: {
    title: string
    notes?: string
    categoryId: string | null
    priority: Priority
    dueDate?: string | null
    isTodayPriority?: boolean
  }) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTaskComplete: (id: string) => void
  togglePriority: (id: string) => void

  // brain dump
  addBrainDumpItem: (text: string) => void
  deleteBrainDumpItem: (id: string) => void
  convertBrainDumpToTask: (id: string, patch?: Partial<Task>) => void
  clearBrainDump: () => void

  // habits
  addHabit: (name: string, color: string, icon: string, frequency: Habit['frequency']) => void
  updateHabit: (id: string, patch: Partial<Habit>) => void
  deleteHabit: (id: string) => void

  // reminders
  addReminder: (text: string, time: string | null) => void
  toggleReminder: (id: string) => void
  deleteReminder: (id: string) => void
  toggleHabitDate: (id: string, dateKey: string) => void

  // rewards
  addReward: (title: string, cost: number, icon: string) => void
  deleteReward: (id: string) => void
  redeemReward: (id: string) => boolean

  // settings
  setTheme: (theme: ThemeId) => void
  setFont: (font: FontId) => void
  toggleDarkMode: () => void

  // internal
  awardPoints: (amount: number, reason: string, silent?: boolean) => void
  clearCelebration: () => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      categories: DEFAULT_CATEGORIES,
      tasks: [],
      brainDump: [],
      habits: DEFAULT_HABITS,
      reminders: [],
      rewards: DEFAULT_REWARDS,
      pointsLog: [],
      redemptions: [],
      totalPointsEarned: 0,
      spentPoints: 0,
      settings: { theme: 'aurora', font: 'inter', darkMode: false },
      lastCelebration: null,

      addCategory: (name, color, icon) =>
        set((s) => ({
          categories: [...s.categories, { id: uid(), name, color, icon }],
        })),

      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          tasks: s.tasks.map((t) => (t.categoryId === id ? { ...t, categoryId: null } : t)),
        })),

      addTask: ({ title, notes, categoryId, priority, dueDate, isTodayPriority }) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              id: uid(),
              title,
              notes,
              categoryId,
              priority,
              dueDate: dueDate ?? null,
              completed: false,
              createdAt: Date.now(),
              completedAt: null,
              isTodayPriority: !!isTodayPriority,
              priorityDate: isTodayPriority ? todayKey() : null,
            },
          ],
        })),

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      deleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
        })),

      toggleTaskComplete: (id) => {
        const task = get().tasks.find((t) => t.id === id)
        if (!task) return
        const willComplete = !task.completed
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, completed: willComplete, completedAt: willComplete ? Date.now() : null }
              : t,
          ),
        }))
        if (willComplete) {
          let pts = TASK_POINTS[task.priority]
          if (task.isTodayPriority) pts += TODAY_PRIORITY_BONUS
          get().awardPoints(pts, `Completed "${task.title}"`)
        }
      },

      togglePriority: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  isTodayPriority: !t.isTodayPriority,
                  priorityDate: !t.isTodayPriority ? todayKey() : null,
                }
              : t,
          ),
        })),

      addBrainDumpItem: (text) =>
        set((s) => ({
          brainDump: [{ id: uid(), text, createdAt: Date.now() }, ...s.brainDump],
        })),

      deleteBrainDumpItem: (id) =>
        set((s) => ({ brainDump: s.brainDump.filter((b) => b.id !== id) })),

      convertBrainDumpToTask: (id, patch) => {
        const item = get().brainDump.find((b) => b.id === id)
        if (!item) return
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              id: uid(),
              title: item.text,
              categoryId: null,
              priority: 'medium',
              completed: false,
              createdAt: Date.now(),
              completedAt: null,
              isTodayPriority: false,
              priorityDate: null,
              ...patch,
            },
          ],
          brainDump: s.brainDump.filter((b) => b.id !== id),
        }))
        get().awardPoints(BRAIN_DUMP_CONVERT_POINTS, 'Organized a brain dump item', true)
      },

      clearBrainDump: () => set({ brainDump: [] }),

      addHabit: (name, color, icon, frequency) =>
        set((s) => ({
          habits: [
            ...s.habits,
            { id: uid(), name, color, icon, frequency, customDays: [], completions: {}, createdAt: Date.now() },
          ],
        })),

      updateHabit: (id, patch) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),

      deleteHabit: (id) => set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),

      toggleHabitDate: (id, dateKey) => {
        const habit = get().habits.find((h) => h.id === id)
        if (!habit) return
        const wasDone = !!habit.completions[dateKey]
        const nextCompletions = { ...habit.completions }
        if (wasDone) {
          delete nextCompletions[dateKey]
        } else {
          nextCompletions[dateKey] = true
        }
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, completions: nextCompletions } : h)),
        }))
        if (!wasDone && dateKey === todayKey()) {
          const { current } = calcHabitStreak(nextCompletions)
          const pts = HABIT_BASE_POINTS + habitStreakBonus(current)
          get().awardPoints(pts, `${habit.name} — day ${current} streak`)
        }
      },

      addReminder: (text, time) =>
        set((s) => ({
          reminders: [
            ...s.reminders,
            { id: uid(), text, time, done: false, createdAt: Date.now() },
          ],
        })),

      toggleReminder: (id) => {
        const reminder = get().reminders.find((r) => r.id === id)
        if (!reminder) return
        const willComplete = !reminder.done
        set((s) => ({
          reminders: s.reminders.map((r) => (r.id === id ? { ...r, done: willComplete } : r)),
        }))
        if (willComplete) {
          get().awardPoints(REMINDER_POINTS, `Reminder: "${reminder.text}"`)
        }
      },

      deleteReminder: (id) =>
        set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),

      addReward: (title, cost, icon) =>
        set((s) => ({
          rewards: [...s.rewards, { id: uid(), title, cost, icon, createdAt: Date.now() }],
        })),

      deleteReward: (id) => set((s) => ({ rewards: s.rewards.filter((r) => r.id !== id) })),

      redeemReward: (id) => {
        const reward = get().rewards.find((r) => r.id === id)
        if (!reward) return false
        const s = get()
        const available = s.totalPointsEarned - s.spentPoints
        if (available < reward.cost) return false
        set((st) => ({
          spentPoints: st.spentPoints + reward.cost,
          redemptions: [
            {
              id: uid(),
              rewardId: reward.id,
              rewardTitle: reward.title,
              cost: reward.cost,
              timestamp: Date.now(),
            },
            ...st.redemptions,
          ],
        }))
        return true
      },

      setTheme: (theme) => set((s) => ({ settings: { ...s.settings, theme } })),
      setFont: (font) => set((s) => ({ settings: { ...s.settings, font } })),
      toggleDarkMode: () =>
        set((s) => ({ settings: { ...s.settings, darkMode: !s.settings.darkMode } })),

      awardPoints: (amount, reason, silent) => {
        set((s) => ({
          totalPointsEarned: s.totalPointsEarned + amount,
          pointsLog: [{ id: uid(), amount, reason, timestamp: Date.now() }, ...s.pointsLog].slice(0, 200),
          lastCelebration: silent ? s.lastCelebration : { id: uid(), points: amount, reason },
        }))
      },

      clearCelebration: () => set({ lastCelebration: null }),
    }),
    {
      name: 'ultimate-productivity-app',
      version: 1,
    },
  ),
)
