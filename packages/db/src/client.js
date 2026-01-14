"use strict";
/*
  Prisma v6 Note:
  @bickford/db intentionally uses a CommonJS require("@prisma/client")
  to instantiate PrismaClient. This avoids a known Prisma v6 + TypeScript +
  package `exports` resolution issue in monorepos where named/default/namespace
  imports fail despite correctly generated types. This is a compatibility choice,
  not a workaround for missing generation.
*/
/* eslint-disable @typescript-eslint/no-var-requires */
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const Prisma = require("@prisma/client");
exports.prisma = global.__bickford_prisma__ ??
    new Prisma.PrismaClient({
        log: ["error", "warn"],
    });
if (process.env.NODE_ENV !== "production") {
    global.__bickford_prisma__ = exports.prisma;
}
