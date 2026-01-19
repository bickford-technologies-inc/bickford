import { ControlClassification } from "./classifications";
import { Jurisdiction } from "./jurisdictions";

export type ExportContext = {
  classification: ControlClassification;
  origin: Jurisdiction;
  destination: Jurisdiction;
  hasExportLicense: boolean;
  licenseId?: string;
};

export function isExportAllowed(ctx: ExportContext): boolean {
  if (ctx.classification === ControlClassification.ITAR) {
    return (
      ctx.origin === Jurisdiction.US &&
      ctx.destination !== Jurisdiction.NON_ALLIED &&
      ctx.hasExportLicense === true
    );
  }

  if (ctx.classification === ControlClassification.EAR_CONTROLLED) {
    return ctx.destination !== Jurisdiction.NON_ALLIED;
  }

  if (ctx.classification === ControlClassification.ALLIED_RESTRICTED) {
    return (
      ctx.destination === Jurisdiction.NATO ||
      ctx.destination === Jurisdiction.FIVE_EYES
    );
  }

  return true; // EAR99
}
