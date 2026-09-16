import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { CelebrationToast } from './components/CelebrationToast'
import { useTheme } from './hooks/useTheme'
import type { SectionId } from './types'
import { Dashboard } from './sections/Dashboard'
import { BrainDumpSection } from './sections/BrainDump'
import { PrioritiesSection } from './sections/Priorities'
import { TasksSection } from './sections/Tasks'
import { HabitsSection } from './sections/Habits'
import { RewardsSection } from './sections/Rewards'
import { SettingsSection } from './sections/Settings'

function SectionView({
  section,
  onNavigate,
}: {
  section: SectionId
  onNavigate: (s: SectionId) => void
}) {
  switch (section) {
    case 'dashboard':
      return <Dashboard onNavigate={onNavigate} />
    case 'braindump':
      return <BrainDumpSection />
    case 'priorities':
      return <PrioritiesSection />
    case 'tasks':
      return <TasksSection />
    case 'habits':
      return <HabitsSection />
    case 'rewards':
      return <RewardsSection />
    case 'settings':
      return <SettingsSection />
    default:
      return null
  }
}

function App() {
  const [section, setSection] = useState<SectionId>('dashboard')
  useTheme()

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Sidebar active={section} onChange={setSection} />
      <div className="flex min-h-screen flex-1 flex-col pb-16 md:pb-0">
        <TopBar section={section} />
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <SectionView section={section} onNavigate={setSection} />
        </main>
      </div>
      <CelebrationToast />
    </div>
  )
}

export default App
