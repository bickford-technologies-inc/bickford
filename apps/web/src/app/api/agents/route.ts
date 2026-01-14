import { getPrisma } from "@bickford/db";

export async function POST(req: Request) {
  const prisma = getPrisma();
  try {
    const body = await req.json();
    const { agentId, ttvBaseline } = body;

    // Validate input
    if (!agentId || typeof agentId !== "string" || agentId.trim() === "") {
      return Response.json(
        { error: "Missing or invalid 'agentId' field" },
        { status: 400 }
      );
    }

    if (typeof ttvBaseline !== "number" || ttvBaseline < 0) {
      return Response.json(
        { error: "'ttvBaseline' must be a non-negative number" },
        { status: 400 }
      );
    }

    const agent = await prisma.agentState.upsert({
      where: { agentId },
      update: { ttvBaseline },
      create: { agentId, ttvBaseline },
    });

    return Response.json(agent);
  } catch (error) {
    console.error("Error in POST /api/agents:", error);
    return Response.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const prisma = getPrisma();
  try {
    const agents = await prisma.agentState.findMany();
    return Response.json(agents);
  } catch (error) {
    console.error("Error in GET /api/agents:", error);
    return Response.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
