declare const Prisma: any;
declare global {
    var __bickford_prisma__: InstanceType<typeof Prisma.PrismaClient> | undefined;
}
export declare const prisma: any;
export type { PrismaClient } from "@prisma/client";
