// prisma.config.js for Prisma 5+ datasource config
module.exports = {
  datasource: {
    provider: "postgresql",
    url: {
      fromEnvVar: "DATABASE_URL",
    },
  },
};
