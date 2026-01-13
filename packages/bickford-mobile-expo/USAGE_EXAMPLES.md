# Crash Prevention Usage Examples

## Quick Start

After implementation, the crash prevention system is **automatically initialized** when your app starts. No additional setup required!

## Example 1: React Component Error (Caught by ErrorBoundary)

### Before (Would Crash)
```typescript
function MyComponent() {
  const data = fetchData(); // Throws error
  return <View>{data.value}</View>; // Crash!
}
```

### After (Gracefully Handled)
```typescript
// App.tsx already wraps everything in ErrorBoundary
function MyComponent() {
  const data = fetchData(); // Throws error
  // ErrorBoundary catches it and shows fallback UI instead of crashing
  return <View>{data.value}</View>;
}
```

**Result**: User sees "Something went wrong" message instead of app crash.

## Example 2: Async Operation Error

### Before (Would Crash)
```typescript
async function loadUserData() {
  const response = await fetch('/api/user'); // Network error
  const data = await response.json(); // Could throw
  return data;
}
```

### After (Safe with fallback)
```typescript
import { safeAsync } from './src/utils/errorRecovery';

async function loadUserData() {
  return await safeAsync(
    async () => {
      const response = await fetch('/api/user');
      const data = await response.json();
      return data;
    },
    'loadUserData',
    { name: 'Guest', id: null } // Fallback value
  );
}
```

**Result**: Returns fallback user data instead of crashing.

## Example 3: Unhandled Promise Rejection

### Before (Could Crash)
```typescript
// Somewhere in your code
Promise.reject('API unavailable'); // Unhandled rejection
```

### After (Automatically Caught)
```typescript
// setupGlobalErrorHandlers() is called at app startup
Promise.reject('API unavailable');
// Automatically caught, logged, no crash
```

**Result**: Error logged to console, app continues running.

## Example 4: Native Module Call

### Before (Could Crash)
```typescript
import { NativeModules } from 'react-native';

async function useNativeFeature() {
  // If native module throws, could crash
  return await NativeModules.CustomModule.doSomething();
}
```

### After (Safe with error handling)
```typescript
import { NativeModules } from 'react-native';
import { safeNativeCall } from './src/utils/errorRecovery';

async function useNativeFeature() {
  return await safeNativeCall(
    () => NativeModules.CustomModule.doSomething(),
    'CustomModule.doSomething',
    null // Fallback value
  );
}
```

**Result**: Returns null if native call fails, no crash.

## Example 5: Validation with Fallback

### Before (Would Crash with Assertion)
```typescript
function processValue(input: string | null) {
  if (!input) {
    throw new Error('Input is required!'); // Crash
  }
  return input.toUpperCase();
}
```

### After (Safe with fallback)
```typescript
import { validateOrFallback } from './src/utils/errorRecovery';

function processValue(input: string | null) {
  const safeInput = validateOrFallback(
    input,
    (v) => v !== null && v.length > 0,
    'DEFAULT',
    'input'
  );
  return safeInput.toUpperCase();
}
```

**Result**: Uses "DEFAULT" if input is invalid, no crash.

## Example 6: Critical Initialization

### Before (Would Crash)
```typescript
function initializeApp() {
  const config = loadConfig(); // Could throw
  const db = setupDatabase(config); // Could throw
  return { config, db };
}
```

### After (Protected)
```typescript
import { withCrashGuard } from './src/utils/errorRecovery';

function initializeApp() {
  return withCrashGuard(() => {
    const config = loadConfig();
    const db = setupDatabase(config);
    return { config, db };
  }, 'App initialization');
}

// In App.tsx
const appData = initializeApp();
if (!appData) {
  // Show error UI instead of crashing
  return <InitializationError />;
}
```

**Result**: Returns null if initialization fails, shows error UI.

## Example 7: Logging Instead of Throwing

### Before (Would Eventually Crash)
```typescript
function processPayment(amount: number) {
  if (amount <= 0) {
    throw new Error('Invalid amount'); // Bad!
  }
  // process payment
}
```

### After (Safe Logging)
```typescript
import { errorLogger } from './src/services/errorLogger';

function processPayment(amount: number) {
  if (amount <= 0) {
    errorLogger.logError('Invalid payment amount', undefined, { amount });
    return { success: false, error: 'Invalid amount' };
  }
  // process payment
  return { success: true };
}
```

**Result**: Error logged, function returns error object, no crash.

## Example 8: Component-Level Error Boundary

You can also use ErrorBoundary at the component level:

```typescript
import { ErrorBoundary } from './src/components/ErrorBoundary';

function Dashboard() {
  return (
    <View>
      <Header />
      <ErrorBoundary fallback={<Text>Chart unavailable</Text>}>
        <ComplexChart /> {/* If this crashes, only chart fails */}
      </ErrorBoundary>
      <Footer />
    </View>
  );
}
```

**Result**: If ComplexChart crashes, only that component shows error, rest of app works.

## Testing Error Recovery

### Test React Errors
```typescript
// Add a button to test error boundary
<Button
  title="Test Error Boundary"
  onPress={() => {
    throw new Error('Test error');
  }}
/>
```

### Test Async Errors
```typescript
<Button
  title="Test Async Error"
  onPress={async () => {
    const result = await safeAsync(
      async () => {
        throw new Error('Async test error');
      },
      'test'
    );
    console.log('Result:', result); // undefined
  }}
/>
```

### Test Unhandled Rejection
```typescript
<Button
  title="Test Unhandled Rejection"
  onPress={() => {
    Promise.reject('Test rejection');
    // Check console - should see error logged, no crash
  }}
/>
```

## Error Logs and Statistics

View error logs in development:

```typescript
import { errorLogger } from './src/services/errorLogger';

// Get all logs
const logs = errorLogger.getLogs();
console.log('All errors:', logs);

// Get statistics
const stats = errorLogger.getStats();
console.log('Error stats:', stats);
// { total: 5, errors: 3, warnings: 2, info: 0 }

// Clear logs
errorLogger.clearLogs();
```

## Production Integration

For production crash reporting, add Sentry:

```typescript
// In src/services/errorLogger.ts
import * as Sentry from '@sentry/react-native';

logError(message: string, error?: Error, context?: any) {
  // ... existing code ...
  
  if (error) {
    Sentry.captureException(error, {
      contexts: { custom: context }
    });
  }
}
```

## Best Practices Summary

1. **Always use safe wrappers** for risky operations
2. **Log instead of throw** in production code
3. **Provide fallback values** for all operations
4. **Never throw from error handlers** (error boundaries, catch blocks)
5. **Test error scenarios** during development
6. **Monitor error logs** in production

## Common Patterns

### Pattern: Safe Data Fetching
```typescript
const fetchData = async (url: string) => {
  return await safeAsync(
    async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Fetch failed');
      return await response.json();
    },
    'fetchData',
    [] // Empty array fallback
  );
};
```

### Pattern: Safe Storage Access
```typescript
const getValue = async (key: string) => {
  return await safeNativeCall(
    () => AsyncStorage.getItem(key),
    'AsyncStorage.getItem',
    null
  );
};
```

### Pattern: Validated User Input
```typescript
const processInput = (input: string | null) => {
  return validateOrFallback(
    input,
    (v) => v.trim().length > 0,
    '',
    'userInput'
  );
};
```

---

## Questions?

See [CRASH_PREVENTION.md](./CRASH_PREVENTION.md) for full documentation.
