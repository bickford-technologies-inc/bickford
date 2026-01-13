// This file exists purely to break bad imports
// Do not import PrismaClient directly in apps/web

declare module "@prisma/client" {
  export class PrismaClient {
    private __DO_NOT_INSTANTIATE_PRISMA_DIRECTLY__: never;
  }
}
