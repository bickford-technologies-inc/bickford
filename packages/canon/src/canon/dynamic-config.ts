/**
 * Lightweight Dynamic Configuration System
 * TIMESTAMP: 2026-01-19T23:13:00Z
 *
 * Multi-context configuration that adapts without requiring constant edits.
 * Supports environment transitions, feature flags, and context-aware settings.
 */

export type ConfigContext = "development" | "staging" | "production" | "test" | "edge" | "node";

export interface ConfigTransition {
  from: ConfigContext;
  to: ConfigContext;
  ts: string;
  reason?: string;
}

export interface DynamicConfigEntry<T = unknown> {
  key: string;
  value: T;
  contexts: ConfigContext[];
  priority: number; // Higher priority overrides lower
  validUntil?: string; // Optional expiration
  metadata?: {
    source?: string;
    description?: string;
    tags?: string[];
  };
}

export interface ConfigResolutionResult<T = unknown> {
  value: T;
  source: string;
  context: ConfigContext;
  priority: number;
}

/**
 * Lightweight dynamic configuration manager
 */
export class DynamicConfigManager {
  private entries: Map<string, DynamicConfigEntry[]> = new Map();
  private currentContext: ConfigContext;
  private transitionHistory: ConfigTransition[] = [];

  constructor(initialContext: ConfigContext = "development") {
    this.currentContext = initialContext;
  }

  /**
   * Register a configuration entry
   */
  register<T>(entry: DynamicConfigEntry<T>): void {
    const existing = this.entries.get(entry.key) || [];
    
    // Remove expired entries
    const now = new Date().toISOString();
    const valid = existing.filter(
      (e) => !e.validUntil || e.validUntil > now
    );

    valid.push(entry);
    
    // Sort by priority (highest first)
    valid.sort((a, b) => b.priority - a.priority);
    
    this.entries.set(entry.key, valid);
  }

  /**
   * Resolve configuration value for current context
   */
  resolve<T>(key: string, defaultValue?: T): ConfigResolutionResult<T> | null {
    const entries = this.entries.get(key);
    if (!entries || entries.length === 0) {
      if (defaultValue !== undefined) {
        return {
          value: defaultValue,
          source: "default",
          context: this.currentContext,
          priority: -1,
        };
      }
      return null;
    }

    const now = new Date().toISOString();

    // Find best match for current context
    for (const entry of entries) {
      // Check expiration
      if (entry.validUntil && entry.validUntil < now) continue;

      // Check context match
      if (
        entry.contexts.includes(this.currentContext) ||
        entry.contexts.includes("*" as any)
      ) {
        return {
          value: entry.value as T,
          source: entry.metadata?.source || "dynamic-config",
          context: this.currentContext,
          priority: entry.priority,
        };
      }
    }

    // Fallback to default
    if (defaultValue !== undefined) {
      return {
        value: defaultValue,
        source: "default",
        context: this.currentContext,
        priority: -1,
      };
    }

    return null;
  }

  /**
   * Transition to a new context
   */
  transition(
    to: ConfigContext,
    reason?: string
  ): ConfigTransition {
    const transition: ConfigTransition = {
      from: this.currentContext,
      to,
      ts: new Date().toISOString(),
      reason,
    };

    this.currentContext = to;
    this.transitionHistory.push(transition);

    // Prune old history (keep last 100)
    if (this.transitionHistory.length > 100) {
      this.transitionHistory = this.transitionHistory.slice(-100);
    }

    return transition;
  }

  /**
   * Get current context
   */
  getContext(): ConfigContext {
    return this.currentContext;
  }

  /**
   * Get transition history
   */
  getTransitionHistory(): ConfigTransition[] {
    return [...this.transitionHistory];
  }

  /**
   * Get all registered keys
   */
  getKeys(): string[] {
    return Array.from(this.entries.keys());
  }

  /**
   * Export configuration snapshot for current context
   */
  exportSnapshot(): Record<string, unknown> {
    const snapshot: Record<string, unknown> = {};
    for (const key of this.entries.keys()) {
      const result = this.resolve(key);
      if (result) {
        snapshot[key] = result.value;
      }
    }
    return snapshot;
  }

  /**
   * Clear expired entries (maintenance)
   */
  pruneExpired(): number {
    const now = new Date().toISOString();
    let pruned = 0;

    for (const [key, entries] of this.entries.entries()) {
      const valid = entries.filter((e) => !e.validUntil || e.validUntil > now);
      if (valid.length !== entries.length) {
        pruned += entries.length - valid.length;
        if (valid.length === 0) {
          this.entries.delete(key);
        } else {
          this.entries.set(key, valid);
        }
      }
    }

    return pruned;
  }
}

/**
 * Context-aware configuration builder
 */
export class ConfigBuilder<T> {
  private configs: DynamicConfigEntry<T>[] = [];

  constructor(private key: string) {}

  /**
   * Add configuration for specific contexts
   */
  for(contexts: ConfigContext[], value: T, priority: number = 0): this {
    this.configs.push({
      key: this.key,
      value,
      contexts,
      priority,
    });
    return this;
  }

  /**
   * Add configuration for all contexts
   */
  forAll(value: T, priority: number = 0): this {
    return this.for(["*" as any], value, priority);
  }

  /**
   * Add configuration for production
   */
  forProduction(value: T, priority: number = 10): this {
    return this.for(["production"], value, priority);
  }

  /**
   * Add configuration for development
   */
  forDevelopment(value: T, priority: number = 5): this {
    return this.for(["development"], value, priority);
  }

  /**
   * Add configuration with expiration
   */
  withExpiration(validUntil: string): this {
    if (this.configs.length > 0) {
      this.configs[this.configs.length - 1].validUntil = validUntil;
    }
    return this;
  }

  /**
   * Add metadata
   */
  withMetadata(metadata: DynamicConfigEntry["metadata"]): this {
    if (this.configs.length > 0) {
      this.configs[this.configs.length - 1].metadata = {
        ...this.configs[this.configs.length - 1].metadata,
        ...metadata,
      };
    }
    return this;
  }

  /**
   * Build and register all configurations
   */
  build(manager: DynamicConfigManager): void {
    for (const config of this.configs) {
      manager.register(config);
    }
  }

  /**
   * Get all configurations
   */
  getConfigs(): DynamicConfigEntry<T>[] {
    return [...this.configs];
  }
}

/**
 * Create a configuration builder
 */
export function config<T>(key: string): ConfigBuilder<T> {
  return new ConfigBuilder<T>(key);
}

/**
 * Auto-detect runtime context
 */
export function detectContext(): ConfigContext {
  // Check for edge runtime first
  if (typeof (globalThis as any).EdgeRuntime !== "undefined") {
    return "edge";
  }

  // Check if we have process (Node.js environment)
  const hasProcess = typeof (globalThis as any).process !== "undefined";
  if (!hasProcess) return "edge";

  // Get environment variables safely
  const proc = (globalThis as any).process;
  const env = proc?.env?.NODE_ENV;
  const nextRuntime = proc?.env?.NEXT_RUNTIME;

  if (nextRuntime === "edge") return "edge";
  if (env === "test") return "test";
  if (env === "production") return "production";
  if (env === "staging") return "staging";
  return "development";
}

/**
 * Global configuration manager instance
 */
let globalManager: DynamicConfigManager | null = null;

export function getGlobalConfig(): DynamicConfigManager {
  if (!globalManager) {
    globalManager = new DynamicConfigManager(detectContext());
  }
  return globalManager;
}
