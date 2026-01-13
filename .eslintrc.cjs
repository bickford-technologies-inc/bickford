module.exports = {
  // ...existing code...
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "@prisma/client",
                message:
                  "Direct Prisma imports are forbidden. Use apps/web/src/lib/prisma.ts only.",
              },
            ],
          },
        ],
      },
    },
  ],
  // ...code...
};
