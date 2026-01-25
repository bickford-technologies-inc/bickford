// Re-export for legacy compatibility with app/api/chat/route.ts

// Stubs for missing functions
export async function saveMessage(...args: any[]): Promise<any> {
  return { id: "stub-message", ...args };
}
export async function getMessages(...args: any[]): Promise<any[]> {
  return [];
}
export async function saveLedgerEntry(...args: any[]): Promise<any> {
  return { id: "stub-ledger-entry", ...args };
}
export async function getLedgerEntries(...args: any[]): Promise<any[]> {
  return [];
}

export {
  searchConversationMemory,
  buildConversationMemoryContext,
} from "./conversationMemory";
