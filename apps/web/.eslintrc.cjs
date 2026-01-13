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
  },
};
