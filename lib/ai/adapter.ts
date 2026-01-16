// Canon-safe adapter for time (audit-grade)
// Usage: adapter.now()

export const adapter = {
  now() {
    return Date.now();
  },
};
