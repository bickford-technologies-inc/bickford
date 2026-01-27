import { isExportAllowed, ExportContext } from "../export-control/checks.js";

export const EXPORT_CONTROL_INVARIANT = {
  id: "EXPORT_CONTROL_ENFORCED",
  description:
    "Decisions must not violate ITAR, EAR, or allied export restrictions",
  assert(ctx: ExportContext) {
    if (!isExportAllowed(ctx)) {
      return {
        ok: false,
        reason: "Export control violation detected",
      };
    }

    if (
      ctx.classification === "ITAR" &&
      (!ctx.hasExportLicense || !ctx.licenseId)
    ) {
      return {
        ok: false,
        reason: "ITAR action without valid export license",
      };
    }

    return { ok: true };
  },
};
