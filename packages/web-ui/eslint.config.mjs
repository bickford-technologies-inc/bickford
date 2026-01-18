export default [
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@/lib/ledger/*"],
        },
      ],
    },
  },
];
