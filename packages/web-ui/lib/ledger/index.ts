export const isEdge =
  typeof process === "undefined" || process.env.NEXT_RUNTIME === "edge";

export const ledger = isEdge
  ? await import("./fs-ledger.edge")
  : await import("./fs-ledger.node");
