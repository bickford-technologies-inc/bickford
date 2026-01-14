/**
 * Canon Status API Route
 * Returns the current status of canon enforcement
 */

export async function GET() {
  try {
    const status = {
      active: true,
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      canonRefs: ["ui-surface-only"], // UI-safe placeholder
    };

    return Response.json(status);
  } catch (error) {
    console.error("Error in /api/canon:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
