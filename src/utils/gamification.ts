import type { Priority } from '../types'

export const TASK_POINTS: Record<Priority, number> = {
  low: 10,
  medium: 20,
  high: 35,
}

export const TODAY_PRIORITY_BONUS = 15
export const HABIT_BASE_POINTS = 15
export const BRAIN_DUMP_CONVERT_POINTS = 2
export const REMINDER_POINTS = 5

export function habitStreakBonus(streak: number): number {
  if (streak <= 1) return 0
  return Math.min(Math.floor(streak / 3) * 5, 50)
}

// Level thresholds grow roughly quadratically so early levels come fast
// and later levels take sustained effort.
export function totalPointsForLevel(level: number): number {
  return Math.round(50 * Math.pow(level - 1, 1.6))
}

export interface LevelInfo {
  level: number
  title: string
  currentLevelFloor: number
  nextLevelCeiling: number
  progress: number
}

const LEVEL_TITLES = [
  'Newcomer',
  'Starter',
  'Doer',
  'Achiever',
  'Go-Getter',
  'Focused',
  'Consistent',
  'Productive',
  'Disciplined',
  'Momentum Builder',
  'High Performer',
  'Overachiever',
  'Taskmaster',
  'Unstoppable',
  'Elite',
  'Visionary',
  'Legend',
  'Icon',
  'Grandmaster',
  'Productivity Sage',
]

export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]
}

export function getLevelInfo(totalPoints: number): LevelInfo {
  let level = 1
  while (totalPointsForLevel(level + 1) <= totalPoints) {
    level++
    if (level > 200) break
  }
  const floor = totalPointsForLevel(level)
  const ceiling = totalPointsForLevel(level + 1)
  const progress = ceiling > floor ? (totalPoints - floor) / (ceiling - floor) : 1
  return {
    level,
    title: levelTitle(level),
    currentLevelFloor: floor,
    nextLevelCeiling: ceiling,
    progress: Math.max(0, Math.min(1, progress)),
  }
}

export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function daysAgoKey(daysAgo: number, from: Date = new Date()): string {
  const d = new Date(from)
  d.setDate(d.getDate() - daysAgo)
  return todayKey(d)
}

export function calcHabitStreak(completions: Record<string, boolean>): {
  current: number
  best: number
} {
  const dates = Object.keys(completions).filter((k) => completions[k])
  if (dates.length === 0) return { current: 0, best: 0 }
  const set = new Set(dates)

  let current = 0
  const cursor = new Date()
  // if today isn't done yet, streak counts back from yesterday
  if (!set.has(todayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (set.has(todayKey(cursor))) {
    current++
    cursor.setDate(cursor.getDate() - 1)
  }

  // best streak: scan sorted unique dates
  const sorted = [...set].sort()
  let best = 0
  let run = 0
  let prev: Date | null = null
  for (const s of sorted) {
    const d = new Date(s + 'T00:00:00')
    if (prev) {
      const diff = Math.round((d.getTime() - prev.getTime()) / 86400000)
      run = diff === 1 ? run + 1 : 1
    } else {
      run = 1
    }
    best = Math.max(best, run)
    prev = d
  }

  return { current, best }
}
