import { ControlClassification } from "../export-control/classifications";
import { Jurisdiction } from "../export-control/jurisdictions";

export type ExportDecisionArtifact = {
  decisionId: string;
  classification: ControlClassification;
  origin: Jurisdiction;
  destination: Jurisdiction;
  exportAllowed: boolean;
  licenseId?: string;
  humanAuthorityId: string;
  ts: number;
};
