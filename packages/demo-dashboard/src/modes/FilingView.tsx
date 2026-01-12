import { CanonBar } from '../filing/CanonBar'
import { BranchGrid } from '../filing/BranchGrid'
import { ChatInput } from '../chat/ChatInput'

export function FilingView() {
  return (
    <main className="filingMode">
      <CanonBar />
      <BranchGrid />
      <div className="filingInputDock">
        <ChatInput placeholder="Route intent…" />
      </div>
    </main>
  )
}
