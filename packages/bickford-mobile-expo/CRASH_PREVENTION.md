# iOS Crash Prevention Implementation

## Overview

This document describes the comprehensive crash prevention system implemented to prevent SIGABRT crashes in the Bickford iOS app, specifically addressing issues with Expo error recovery and uncaught Objective-C exceptions.

## Problem Statement

The app was experiencing crashes with the following characteristics:
- **Exception Type**: `EXC_CRASH (SIGABRT)`
- **Termination Reason**: `Abort trap: 6`
- **Thread**: `expo.controller.errorRecoveryQueue`
- **Root Cause**: Uncaught Objective-C exceptions in Expo error recovery handler

## Solution Architecture

### 1. React-Level Error Boundary

**File**: `src/components/ErrorBoundary.tsx`

- Catches all React component errors
- Prevents error propagation to native layer
- Displays graceful fallback UI instead of crashing
- Logs errors for debugging without throwing

**Usage**:
```tsx
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

### 2. Error Recovery Utilities

**File**: `src/utils/errorRecovery.ts`

Provides essential utilities for crash-free error handling:

#### `safeAsync<T>(operation, operationName, fallback?)`
Wraps async operations to catch and log errors instead of crashing:
```typescript
const result = await safeAsync(
  async () => await riskyOperation(),
  'riskyOperation',
  defaultValue
);
```

#### `safeSync<T>(operation, operationName, fallback?)`
Wraps sync operations to catch and log errors:
```typescript
const result = safeSync(
  () => riskyOperation(),
  'riskyOperation',
  defaultValue
);
```

#### `setupGlobalErrorHandlers()`
Installs global handlers for:
- Unhandled promise rejections
- Uncaught exceptions
- Expo ErrorUtils integration

**Critical**: Prevents escalation to `expo.controller.errorRecoveryQueue` crashes.

#### `safeNativeCall<T>(nativeCall, callName, fallback?)`
Wraps native module calls to prevent crashes:
```typescript
const result = await safeNativeCall(
  () => NativeModules.MyModule.riskyMethod(),
  'MyModule.riskyMethod',
  defaultValue
);
```

#### `withCrashGuard<T>(operation, operationName)`
Last-line-of-defense wrapper for critical operations:
```typescript
withCrashGuard(() => {
  criticalInitialization();
}, 'App initialization');
```

### 3. Error Logging Service

**File**: `src/services/errorLogger.ts`

Centralized error logging that replaces throwing with logging:

```typescript
import { errorLogger } from './services/errorLogger';

// Instead of throwing
// throw new Error('Something went wrong');

// Log and continue
errorLogger.logError('Something went wrong', error, { context: 'details' });
```

**Features**:
- In-memory error storage (last 100 errors)
- Error statistics and analytics
- Production-ready (can integrate with Sentry, Crashlytics, etc.)

### 4. Native-Level Crash Guard Plugin

**File**: `plugins/withCrashGuard.ts`

Expo config plugin that modifies iOS AppDelegate to wrap app initialization in `@try/@catch`:

```objc
@try {
  // App initialization
} @catch (NSException *exception) {
  NSLog(@"[CrashGuard] Fatal exception caught: %@", exception);
  // App continues instead of crashing
}
```

This prevents uncaught Objective-C exceptions from escalating to `abort()`.

## Implementation Checklist

### ✅ Completed

1. **ErrorBoundary Component** - Catches React errors
2. **Error Recovery Utilities** - Provides safe wrappers for operations
3. **Error Logging Service** - Centralized error tracking
4. **Native Crash Guard Plugin** - Prevents Objective-C exception crashes
5. **App.tsx Integration** - Uses all error recovery mechanisms
6. **Configuration Updates** - Updated app.json and package.json

### Integration in App.tsx

```typescript
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { setupGlobalErrorHandlers, withCrashGuard } from './src/utils/errorRecovery';
import { setupErrorLogging } from './src/services/errorLogger';

export default function App() {
  useEffect(() => {
    // Initialize error recovery on app launch
    withCrashGuard(() => {
      setupGlobalErrorHandlers();
      setupErrorLogging();
    }, 'App initialization');
  }, []);

  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
```

## Best Practices for Developers

### DO ✅

1. **Use safe wrappers for risky operations**
   ```typescript
   const result = await safeAsync(() => riskyOp(), 'riskyOp');
   ```

2. **Log errors instead of throwing in recovery handlers**
   ```typescript
   errorLogger.logError('Operation failed', error);
   ```

3. **Wrap native module calls**
   ```typescript
   await safeNativeCall(() => NativeModules.X.method(), 'X.method');
   ```

4. **Validate with fallbacks instead of assertions**
   ```typescript
   const value = validateOrFallback(input, isValid, defaultValue, 'myValue');
   ```

### DON'T ❌

1. **Never use fatal exits in production code**
   ```typescript
   // ❌ DON'T
   if (!isValid) {
     throw new Error('Fatal error');
   }
   
   // ✅ DO
   if (!isValid) {
     errorLogger.logError('Validation failed');
     return fallbackValue;
   }
   ```

2. **Never throw from error boundaries or recovery handlers**
   ```typescript
   // ❌ DON'T
   componentDidCatch(error) {
     throw new Error('Error handling failed');
   }
   
   // ✅ DO
   componentDidCatch(error) {
     errorLogger.logError('Component error', error);
   }
   ```

3. **Never use NSAssert, fatalError, or abort() in native code**
   ```objc
   // ❌ DON'T
   NSAssert(condition, @"Condition failed");
   
   // ✅ DO
   if (!condition) {
     NSLog(@"Condition failed - using fallback");
     // handle gracefully
   }
   ```

## Testing the Implementation

### 1. Test React Error Recovery
```typescript
// Intentionally throw in a component
throw new Error('Test error');
// Expected: ErrorBoundary catches and shows fallback UI
```

### 2. Test Async Error Recovery
```typescript
await safeAsync(async () => {
  throw new Error('Async error');
}, 'test');
// Expected: Error logged, no crash, undefined returned
```

### 3. Test Global Error Handler
```typescript
Promise.reject('Unhandled rejection');
// Expected: Error logged, no crash
```

### 4. Verify No SIGABRT Crashes
1. Build with EAS: `npm run eas:build:ios`
2. Submit to TestFlight
3. Monitor crash reports for 24 hours
4. Confirm: No SIGABRT crashes, no uncaught exceptions

## App Store Compliance

This implementation ensures:

✅ **No intentional aborts** - All fatal paths removed
✅ **Graceful degradation** - App recovers or shows safe state
✅ **Production stability** - Errors logged, not thrown
✅ **App Store approval** - No "crashes during normal execution"

## Production Monitoring

To integrate with crash reporting services (Sentry, Firebase Crashlytics):

```typescript
// In errorLogger.ts
import * as Sentry from '@sentry/react-native';

logError(message: string, error?: Error, context?: any) {
  // ... existing code ...
  
  // Send to Sentry
  Sentry.captureException(error || new Error(message), {
    contexts: { custom: context }
  });
}
```

## Maintenance

### When Adding New Features

1. Wrap risky operations with `safeAsync` or `safeSync`
2. Use `errorLogger` instead of throwing
3. Provide fallback values for all operations
4. Never use assertions in production code paths

### When Debugging Crashes

1. Check error logs: `errorLogger.getLogs()`
2. Review error statistics: `errorLogger.getStats()`
3. Add more context to error logs as needed
4. Never "fix" by adding fatal exits

## References

- [Expo Error Handling](https://docs.expo.dev/guides/errors/)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [iOS Crash Report Analysis](https://developer.apple.com/documentation/xcode/diagnosing-issues-using-crash-reports-and-device-logs)
