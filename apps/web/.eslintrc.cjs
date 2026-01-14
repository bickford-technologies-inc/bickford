module.exports = {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "@/lib/prisma",
            importNames: ["getPrisma"],
            message: "getPrisma is forbidden. Import `prisma` directly.",
          },
        ],
      },
    ],
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
};
