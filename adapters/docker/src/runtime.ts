import type {
  ExecutionAdapter,
  ExecutionEvent,
  LedgerEntry,
} from "@bickford/types";

export class DockerAdapter implements ExecutionAdapter {
  runtime = "node" as const;

  loadConfig() {
    return {};
  }

  emit(event: ExecutionEvent) {
    if (event.payload?.hash) {
      console.log(`HASH:${event.payload.hash}`);
    }
  }

  async persist(_entry: LedgerEntry) {}

  now() {
    return 1700000000000; // 🔒 same timestamp
  }
}
