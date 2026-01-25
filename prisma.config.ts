// prisma.config.ts for Prisma 5+ datasource config
import { defineConfig } from "@prisma/internals";

export default defineConfig({
  datasource: {
    provider: "postgresql",
    url: {
      fromEnvVar: "DATABASE_URL",
    },
  },
});
