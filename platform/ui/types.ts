/**
 * Bickford Platform UI - Core Types
 * Declarative screen and workflow definitions
 */

// ============================================================================
// SCREEN ARCHITECTURE
// ============================================================================

export interface ScreenDefinition {
  id: string;
  type: "screen";
  layout: "single" | "split" | "grid" | "tabs";
  components: ScreenComponent[];
  dataBindings: Record<string, DataBinding>;
  actions: Record<string, string>; // action name -> workflow id
  navigation?: NavigationRule[];
}

export interface ScreenComponent {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  source?: string; // Data binding reference
  onSelect?: string; // Action reference
  children?: ScreenComponent[];
}

export type ComponentType =
  | "timeline"
  | "table"
  | "json-viewer"
  | "chat-panel"
  | "diff-panel"
  | "metric-card"
  | "decision-trace"
  | "ledger-viewer"
  | "certificate-display"
  | "compression-stats";

export interface DataBinding {
  type: "static" | "workflow" | "ledger" | "context";
  source: string;
  transform?: string; // Optional transformation function
}

export interface NavigationRule {
  from: string;
  to: string;
  trigger: string;
  params?: Record<string, string>;
}

// ============================================================================
// WORKFLOW ARCHITECTURE
// ============================================================================

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  output: {
    schema: string;
    target?: string; // Where to render output
  };
}

export interface WorkflowStep {
  type: WorkflowStepType;
  id?: string;
  resource?: string;
  params?: Record<string, any>;
  target?: string;
  schema?: string;
  transform?: string;
}

export type WorkflowStepType =
  | "fetch"
  | "transform"
  | "render"
  | "enforce"
  | "compress"
  | "verify"
  | "ledger-append"
  | "proof-generate";

// ============================================================================
// APP ARCHITECTURE
// ============================================================================

export interface AppManifest {
  id: string;
  name: string;
  description: string;
  icon: string;
  entryScreen: string;
  status: "active" | "beta" | "disabled";
  permissions: string[];
  screens: Record<string, ScreenDefinition>;
  workflows: Record<string, WorkflowDefinition>;
}

export interface PlatformManifest {
  version: string;
  apps: AppManifest[];
  sharedWorkflows: Record<string, WorkflowDefinition>;
}

// ============================================================================
// EXECUTION CONTEXT
// ============================================================================

export interface ExecutionContext {
  userId: string;
  organizationId: string;
  requestId: string;
  currentApp?: string;
  currentScreen?: string;
  selectedId?: string;
  parameters?: Record<string, any>;
}

export interface WorkflowResult {
  success: boolean;
  output?: any;
  error?: {
    code: string;
    message: string;
  };
  metadata: {
    executionTime: number;
    stepCount: number;
  };
}
