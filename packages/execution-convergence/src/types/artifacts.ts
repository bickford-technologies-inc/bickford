/**
 * Artifact types for execution convergence.
 * 
 * Defines execution artifacts, intermediate states, and outputs.
 */

export type ArtifactType = "code" | "config" | "data" | "video";

export type VideoArtifactPayload = {
  videoId: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  model: "sora-2" | "sora-2-pro";
  seconds?: string;
  size?: string;
  prompt?: string;
  storageUri?: string;
  thumbnailUri?: string;
  spritesheetUri?: string;
  remixVideoId?: string;
};

export interface ArtifactBase {
  id: string;
  type: ArtifactType;
  content: unknown;
  timestamp: string;
}

export interface VideoArtifact extends ArtifactBase {
  type: "video";
  content: VideoArtifactPayload;
}

export type Artifact = ArtifactBase | VideoArtifact;
