module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow Math.random() outside adapters",
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    if (filename.includes("/adapters/")) return {};

    return {
      CallExpression(node) {
        if (
          node.callee?.object?.name === "Math" &&
          node.callee?.property?.name === "random"
        ) {
          context.report({
            node,
            message:
              "Math.random() is forbidden outside adapters. Use adapter-provided entropy.",
          });
        }
      },
    };
  },
};
