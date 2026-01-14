/**
 * Status API Route
 * Returns the current status of rule enforcement
 */

export async function GET() {
  try {
    const status = {
      active: true,
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      refs: ["ui-surface-only"], // UI-safe placeholder
    };

    return Response.json(status);
  } catch (error) {
    console.error("Error in /api/rules:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
