module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow Date.now() outside adapters",
    },
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    const isAdapter = filename.includes("/adapters/");

    if (isAdapter) return {};

    return {
      CallExpression(node) {
        if (
          node.callee?.object?.name === "Date" &&
          node.callee?.property?.name === "now"
        ) {
          context.report({
            node,
            message:
              "Date.now() is forbidden outside adapters. Use adapter.now().",
          });
        }
      },
    };
  },
};
