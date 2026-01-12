// Canonical credential registry
import { Credential } from "./credentialTypes";

export const credentialRegistry: Credential[] = [
  {
    id: "VERCEL_TOKEN",
    boundary: "vercel.deploy",
    owner: "vercel",
    tier: 3,
    automation: false,
    lifecycle: "BOOTSTRAP_REQUIRED",
    environments: ["production"],
  },
];
