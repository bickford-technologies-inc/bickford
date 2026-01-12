# Jest Testing Configuration

This repository is configured to support TypeScript and React testing using Jest.

## Configuration Files

- **`jest.config.js`**: Main Jest configuration with babel-jest transforms and jsdom environment
- **`babel.config.js`**: Babel configuration for TypeScript, JSX/TSX, and modern JavaScript

## Supported Test File Types

Jest will automatically discover and run test files matching these patterns:
- `*.test.ts` - TypeScript tests
- `*.test.tsx` - React/TypeScript tests
- `*.test.js` - JavaScript tests
- `*.test.jsx` - React/JavaScript tests
- `*.spec.ts`, `*.spec.tsx`, `*.spec.js`, `*.spec.jsx` - Alternative spec format
- Files in `__tests__/` directories

## Running Tests

```bash
# Run all tests across all workspaces
npm test

# Run tests in a specific workspace
npm -w packages/example run test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run a specific test file
npx jest path/to/test.test.ts
```

## Writing Tests

### TypeScript Example

```typescript
// example.test.ts
describe('MyFunction', () => {
  test('should work correctly', () => {
    const result: number = 42;
    expect(result).toBe(42);
  });
});
```

### React Component Example

```tsx
// MyComponent.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  test('renders correctly', () => {
    render(<MyComponent message="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Dependencies

The following testing dependencies are included in the root `package.json`:

- `jest` - Test framework
- `babel-jest` - Babel integration for Jest (primary transformer)
- `@types/jest` - TypeScript type definitions
- `jest-environment-jsdom` - DOM environment for React testing
- `@babel/preset-env` - Modern JavaScript support
- `@babel/preset-typescript` - TypeScript support via Babel
- `@babel/preset-react` - React/JSX support
- `ts-jest` - Available as alternative TypeScript transformer (not currently used)

**Note**: This configuration uses `babel-jest` with Babel presets for TypeScript transformation,
providing consistent handling of TypeScript, JSX/TSX, and modern JavaScript features. The `ts-jest`
package is available as a dependency but not actively used in the current configuration.

## Adding Tests to a Workspace

1. Create test files alongside your source code or in a `__tests__/` directory
2. Update the workspace's `package.json` test script if needed:
   ```json
   {
     "scripts": {
       "test": "jest"
     }
   }
   ```
3. Run tests: `npm -w packages/your-package run test`

## CI/CD Integration

Tests run automatically in CI via the GitHub Actions workflow (`.github/workflows/ci.yml`):
- Triggered on push to `main` or `develop` branches
- Triggered on pull requests to `main`
- Uses `npm test` command which runs tests in all workspaces via Turbo

## Troubleshooting

### "Cannot find module" errors
- Ensure all dependencies are installed: `npm install`
- Check that `moduleNameMapper` in `jest.config.js` matches your `tsconfig.json` paths

### "Unexpected token" errors
- Verify `babel.config.js` includes the necessary presets
- Check that `transform` in `jest.config.js` includes the file extension

### Tests not discovered
- Verify test file names match the patterns in `jest.config.js`
- Check that files aren't in `testPathIgnorePatterns` directories
