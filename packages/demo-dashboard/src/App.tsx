import './App.css'
import { KnowledgePanel } from './components/KnowledgePanel'
import { TopBar } from './layout/TopBar'
import { DerekChat } from './modes/DerekChat'
import { FilingView } from './modes/FilingView'
import { useMode } from './state/modeStore'

export default function App() {
  const { mode } = useMode()
  return (
    <div className="page">
      <TopBar />
      <KnowledgePanel />
      {mode === 'DEREK' ? <DerekChat /> : <FilingView />}
    </div>
  )
}
