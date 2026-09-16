import type { Badge, Habit, Task } from '../types'
import { calcHabitStreak } from './gamification'

export interface BadgeDef extends Badge {
  isEarned: (ctx: {
    tasks: Task[]
    habits: Habit[]
    totalPointsEarned: number
    redemptionCount: number
  }) => boolean
}

export const BADGE_DEFS: BadgeDef[] = [
  {
    id: 'first-task',
    title: 'First Steps',
    description: 'Complete your first task',
    icon: 'CheckCircle2',
    isEarned: ({ tasks }) => tasks.filter((t) => t.completed).length >= 1,
  },
  {
    id: 'ten-tasks',
    title: 'Getting Things Done',
    description: 'Complete 10 tasks',
    icon: 'Target',
    isEarned: ({ tasks }) => tasks.filter((t) => t.completed).length >= 10,
  },
  {
    id: 'fifty-tasks',
    title: 'Taskmaster',
    description: 'Complete 50 tasks',
    icon: 'Award',
    isEarned: ({ tasks }) => tasks.filter((t) => t.completed).length >= 50,
  },
  {
    id: 'habit-week',
    title: 'Habit Former',
    description: 'Reach a 7-day streak on any habit',
    icon: 'Flame',
    isEarned: ({ habits }) => habits.some((h) => calcHabitStreak(h.completions).best >= 7),
  },
  {
    id: 'habit-month',
    title: 'Unstoppable',
    description: 'Reach a 30-day streak on any habit',
    icon: 'Sparkles',
    isEarned: ({ habits }) => habits.some((h) => calcHabitStreak(h.completions).best >= 30),
  },
  {
    id: 'first-redeem',
    title: 'Treat Yourself',
    description: 'Redeem your first reward',
    icon: 'Gift',
    isEarned: ({ redemptionCount }) => redemptionCount >= 1,
  },
  {
    id: 'points-500',
    title: 'Point Collector',
    description: 'Earn 500 lifetime points',
    icon: 'Star',
    isEarned: ({ totalPointsEarned }) => totalPointsEarned >= 500,
  },
  {
    id: 'points-2000',
    title: 'High Achiever',
    description: 'Earn 2,000 lifetime points',
    icon: 'Trophy',
    isEarned: ({ totalPointsEarned }) => totalPointsEarned >= 2000,
  },
]
