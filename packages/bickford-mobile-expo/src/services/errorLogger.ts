/**
 * Error Logging Service
 * 
 * Centralized error logging for production crash prevention.
 * All errors should be logged here instead of throwing.
 */

export interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  error?: Error;
  context?: Record<string, any>;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private maxLogs = 100; // Keep last 100 errors in memory

  /**
   * Log an error without throwing.
   * Use this instead of throwing errors in production.
   */
  logError(message: string, error?: Error, context?: Record<string, any>): void {
    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error,
      context,
    };

    this.logs.push(log);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console log for debugging
    console.error(`[ErrorLogger] ${message}`, error, context);
    
    // In production, this would send to a crash reporting service
    // Example: Sentry.captureException(error, { contexts: { custom: context } });
  }

  /**
   * Log a warning without throwing.
   */
  logWarning(message: string, context?: Record<string, any>): void {
    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
    };

    this.logs.push(log);
    
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    console.warn(`[ErrorLogger] ${message}`, context);
  }

  /**
   * Log an info message.
   */
  logInfo(message: string, context?: Record<string, any>): void {
    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
    };

    this.logs.push(log);
    
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    console.log(`[ErrorLogger] ${message}`, context);
  }

  /**
   * Get all logged errors.
   */
  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Clear all logs.
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get error statistics.
   */
  getStats(): { total: number; errors: number; warnings: number; info: number } {
    return {
      total: this.logs.length,
      errors: this.logs.filter(l => l.level === 'error').length,
      warnings: this.logs.filter(l => l.level === 'warn').length,
      info: this.logs.filter(l => l.level === 'info').length,
    };
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger();

/**
 * Global error handler setup.
 * Call this once at app startup.
 */
export function setupErrorLogging(): void {
  // Override console.error to capture all errors
  const originalError = console.error;
  console.error = (...args: any[]) => {
    errorLogger.logError('Console error', undefined, { args });
    originalError(...args);
  };

  // Override console.warn to capture all warnings
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    errorLogger.logWarning('Console warning', { args });
    originalWarn(...args);
  };
}
