module.exports = {
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector:
          "IfStatement > ExportNamedDeclaration, IfStatement > ExportDefaultDeclaration",
        message:
          "❌ Conditional exports are forbidden. Move guards inside the exported function.",
      },
    ],
  },
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
};
