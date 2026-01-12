import { ChatHistory } from '../chat/ChatHistory'
import { ChatInput } from '../chat/ChatInput'

export function DerekChat() {
  return (
    <main className="chatMode">
      <ChatHistory />
      <div className="chatInputDock">
        <ChatInput placeholder="Ask bickford…" />
      </div>
    </main>
  )
}
