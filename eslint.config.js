import noDateNowOutsideAdapters from "./eslint-rules/no-date-now-outside-adapters.js";
import noMathRandomOutsideAdapters from "./eslint-rules/no-math-random-outside-adapters.js";

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "bickford/no-date-now-outside-adapters": "error",
      "bickford/no-math-random-outside-adapters": "error",
    },
    plugins: {
      bickford: {
        rules: {
          "no-date-now-outside-adapters": noDateNowOutsideAdapters,
          "no-math-random-outside-adapters": noMathRandomOutsideAdapters,
        },
      },
    },
  },
];
