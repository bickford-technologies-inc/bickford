/**
 * Type declarations for React Native global environment
 */

declare global {
  var ErrorUtils: {
    setGlobalHandler: (handler: (error: Error, isFatal?: boolean) => void) => void;
    getGlobalHandler: () => ((error: Error, isFatal?: boolean) => void) | undefined;
  };

  interface Promise<T> {
    reject: (reason: any) => Promise<T>;
  }
}

export {};
