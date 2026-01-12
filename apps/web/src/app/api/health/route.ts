/**
 * Health Check API Route
 * Returns service health status
 */

export async function GET() {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "1.0.0",
    };

    return Response.json(health);
  } catch (error) {
    console.error("Error in /api/health:", error);
    return Response.json(
      { status: "unhealthy", error: "Internal server error" },
      { status: 500 }
    );
  }
}
