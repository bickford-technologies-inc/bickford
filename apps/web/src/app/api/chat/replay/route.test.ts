import { GET } from "./route";
import { NextRequest } from "next/server";

jest.mock("@bickford/db", () => ({
  getPrisma: () => ({
    chatThread: {
      findUnique: jest.fn(() => ({
        id: "t1",
        createdAt: new Date(),
        messages: [
          {
            id: "m1",
            createdAt: new Date(),
            author: "user",
            text: "test",
            resolution: null,
            ruleEntry: {
              id: "r1",
              kind: "INVARIANT",
              title: "Replay Safety",
              content: "Replay cannot execute",
            },
            intent: null,
          },
        ],
      })),
      update: jest.fn(),
    },
  }),
}));

describe("chat replay route", () => {
  it("returns rule linkage and does not execute", async () => {
    const req = {
      nextUrl: { searchParams: new URLSearchParams({ threadId: "t1" }) },
    } as unknown as NextRequest;

    const res = await GET(req);
    const json = await res.json();

    expect(json.mode).toBe("replay");
    expect(json.thread.messages[0].ruleEntry).toBeDefined();
    expect(json.thread.messages[0].intent).toBeNull();
  });
});