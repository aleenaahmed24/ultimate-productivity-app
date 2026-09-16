export type Priority = 'low' | 'medium' | 'high'

export interface Category {
  id: string
  name: string
  color: string
  icon: string
}

export interface Task {
  id: string
  title: string
  notes?: string
  categoryId: string | null
  priority: Priority
  dueDate?: string | null
  completed: boolean
  createdAt: number
  completedAt?: number | null
  isTodayPriority: boolean
  priorityDate?: string | null
}

export interface BrainDumpItem {
  id: string
  text: string
  createdAt: number
}

export interface Habit {
  id: string
  name: string
  color: string
  icon: string
  frequency: 'daily' | 'weekdays' | 'custom'
  customDays: number[]
  completions: Record<string, boolean>
  createdAt: number
}

export interface Reward {
  id: string
  title: string
  cost: number
  icon: string
  createdAt: number
}

export interface RedemptionLogEntry {
  id: string
  rewardId: string
  rewardTitle: string
  cost: number
  timestamp: number
}

export interface PointsLogEntry {
  id: string
  amount: number
  reason: string
  timestamp: number
}

export interface Badge {
  id: string
  title: string
  description: string
  icon: string
}

export type ThemeId =
  | 'aurora'
  | 'sunset'
  | 'ocean'
  | 'forest'
  | 'berry'
  | 'mono'
  | 'candy'
  | 'midnight'

export type FontId =
  | 'inter'
  | 'poppins'
  | 'lora'
  | 'space-grotesk'
  | 'fira-code'
  | 'quicksand'

export interface Settings {
  theme: ThemeId
  font: FontId
  darkMode: boolean
}

export type SectionId =
  | 'dashboard'
  | 'braindump'
  | 'priorities'
  | 'tasks'
  | 'habits'
  | 'rewards'
  | 'settings'

export interface GoogleCalendarEvent {
  id: string
  title: string
  start: string | null
  end: string | null
  allDay: boolean
  htmlLink: string
}

export interface Reminder {
  id: string
  text: string
  time: string | null
  done: boolean
  createdAt: number
}
