import { PrismaClient } from "@prisma/client";
import { MaxTelemetry } from "../max/telemetry";

const prisma = new PrismaClient();

export async function persistMaxTelemetry(t: MaxTelemetry) {
  await prisma.ledgerEntry.create({
    data: {
      type: "MAX_TELEMETRY",
      payload: JSON.stringify(t),
    },
  });
}
