/**
 * Error Recovery Utilities
 * 
 * These utilities prevent fatal crashes by catching and handling errors gracefully.
 * Critical for preventing SIGABRT crashes in production iOS builds.
 */

/// <reference path="../types/global.d.ts" />

/**
 * Safe async execution wrapper that catches and logs errors instead of crashing.
 * Use this for any async operations that might throw.
 * 
 * @example
 * const result = await safeAsync(async () => {
 *   return await riskyOperation();
 * }, 'riskyOperation');
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  operationName: string,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    // Log but never throw - this prevents escalation to abort()
    console.error(`Safe async error in ${operationName}:`, error);
    return fallback;
  }
}

/**
 * Safe sync execution wrapper that catches and logs errors instead of crashing.
 * Use this for any sync operations that might throw.
 * 
 * @example
 * const result = safeSync(() => {
 *   return riskyOperation();
 * }, 'riskyOperation');
 */
export function safeSync<T>(
  operation: () => T,
  operationName: string,
  fallback?: T
): T | undefined {
  try {
    return operation();
  } catch (error) {
    // Log but never throw - this prevents escalation to abort()
    console.error(`Safe sync error in ${operationName}:`, error);
    return fallback;
  }
}

/**
 * Validates a value and returns a safe fallback if invalid.
 * Use this instead of assertions that would cause fatal exits.
 * 
 * @example
 * const safeValue = validateOrFallback(
 *   maybeValue,
 *   (v) => v !== null && v !== undefined,
 *   defaultValue,
 *   'myValue'
 * );
 */
export function validateOrFallback<T>(
  value: T | null | undefined,
  isValid: (v: T) => boolean,
  fallback: T,
  valueName: string
): T {
  if (value === null || value === undefined || !isValid(value)) {
    console.warn(`Invalid value for ${valueName}, using fallback`);
    return fallback;
  }
  return value;
}

/**
 * Global error handler for unhandled promise rejections.
 * This prevents unhandled rejections from escalating to native crashes.
 */
export function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  if (typeof Promise !== 'undefined') {
    const originalReject = Promise.reject;
    Promise.reject = function (reason: any) {
      console.error('Unhandled promise rejection:', reason);
      // Log but don't crash
      return originalReject.call(this, reason);
    };
  }

  // Install global error handler for uncaught exceptions
  if (typeof global !== 'undefined' && global.ErrorUtils) {
    const originalHandler = global.ErrorUtils.getGlobalHandler();
    global.ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      // Log the error
      console.error('Global error handler:', error, 'isFatal:', isFatal);
      
      // Call original handler but don't allow it to crash
      if (originalHandler) {
        try {
          originalHandler(error, false); // Force non-fatal
        } catch (handlerError) {
          console.error('Error in original error handler:', handlerError);
        }
      }
      
      // CRITICAL: Never let errors escape this handler
      // This prevents escalation to expo.controller.errorRecoveryQueue crashes
    });
  }
}

/**
 * Wraps Expo native module calls to prevent crashes.
 * Use this for any calls to native modules that might throw.
 * 
 * @example
 * const result = await safeNativeCall(
 *   () => NativeModules.MyModule.riskyMethod(),
 *   'MyModule.riskyMethod'
 * );
 */
export async function safeNativeCall<T>(
  nativeCall: () => Promise<T>,
  callName: string,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await nativeCall();
  } catch (error) {
    // Log native errors but never propagate them
    console.error(`Native call error in ${callName}:`, error);
    
    // Return fallback instead of crashing
    return fallback;
  }
}

/**
 * Production crash guard - wraps the entire app initialization.
 * This is the last line of defense against crashes.
 */
export function withCrashGuard<T>(
  operation: () => T,
  operationName: string
): T | null {
  try {
    return operation();
  } catch (error) {
    // Fatal error caught - log and prevent crash
    console.error(`FATAL ERROR CAUGHT in ${operationName}:`, error);
    console.error('App would have crashed, but crash guard prevented it');
    
    // Return null to indicate failure, but don't crash
    return null;
  }
}
