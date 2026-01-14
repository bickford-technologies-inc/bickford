/**
 * WhyNot API Route (Phase 3: Trust UX)
 * TIMESTAMP: 2026-01-12T21:35:00Z
 *
 * Replayable WhyNot explanations from denied decision history.
 *
 * GET /api/why-not?actionId=...&tenantId=...
 *
 * Returns all denied decisions for the specified action and/or tenant.
 */

// Canonical domain removed: UI surface only
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const actionId = searchParams.get("actionId") || undefined;
    const tenantId = searchParams.get("tenantId") || undefined;
    const limitStr = searchParams.get("limit");
    const limit = limitStr ? parseInt(limitStr, 10) : 100;

    // Validate at least one filter
    if (!actionId && !tenantId) {
      return Response.json(
        {
          error: "Missing required parameter: actionId or tenantId",
          message: "Provide at least one of: actionId, tenantId",
        },
        { status: 400 }
      );
    }

    // Retrieve denied decisions (stubbed for UI surface)
    const denials = [];

    return Response.json({
      actionId,
      tenantId,
      denials,
    });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/why-not
 *
 * Query denied decisions with more complex filters (future extension)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actionId, tenantId, limit } = body;

    // Validate at least one filter
    if (!actionId && !tenantId) {
      return Response.json(
        {
          error: "Missing required parameter: actionId or tenantId",
          message: "Provide at least one of: actionId, tenantId",
        },
        { status: 400 }
      );
    }

    // Retrieve denied decisions (stubbed for UI surface)
    const denials = [];

    return Response.json({
      actionId,
      tenantId,
      denials,
    });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
