/**
 * Artifact types for execution convergence.
 * 
 * Defines execution artifacts, intermediate states, and outputs.
 */

export type ArtifactType = "code" | "config" | "data";

export interface Artifact {
  id: string;
  type: ArtifactType;
  content: unknown;
  timestamp: string;
}
