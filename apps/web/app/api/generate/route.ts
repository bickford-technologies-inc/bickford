import demo from "../../../data/demo-cio.json";

export async function POST() {
  return Response.json(demo);
}
