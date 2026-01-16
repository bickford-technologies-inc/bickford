import intents from "../../../data/intents.cio.json";

export async function GET() {
  return Response.json(intents);
}
