module.exports = {
  presets: [
    // Modern JavaScript support
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    // TypeScript support
    '@babel/preset-typescript',
    // JSX/TSX support for React
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ],
  ],
};
