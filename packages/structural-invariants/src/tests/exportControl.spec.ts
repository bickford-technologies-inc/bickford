import {
  EXPORT_CONTROL_INVARIANT,
  ControlClassification,
  Jurisdiction,
} from "@bickford/canon";

describe("Export Control / ITAR Invariants", () => {
  test("blocks ITAR export without license", () => {
    const result = EXPORT_CONTROL_INVARIANT.assert({
      classification: ControlClassification.ITAR,
      origin: Jurisdiction.US,
      destination: Jurisdiction.NATO,
      hasExportLicense: false,
    });

    expect(result.ok).toBe(false);
  });

  test("allows ITAR export with license to allied nation", () => {
    const result = EXPORT_CONTROL_INVARIANT.assert({
      classification: ControlClassification.ITAR,
      origin: Jurisdiction.US,
      destination: Jurisdiction.NATO,
      hasExportLicense: true,
      licenseId: "DL-ITAR-001",
    });

    expect(result.ok).toBe(true);
  });

  test("blocks export to non-allied jurisdiction", () => {
    const result = EXPORT_CONTROL_INVARIANT.assert({
      classification: ControlClassification.EAR_CONTROLLED,
      origin: Jurisdiction.US,
      destination: Jurisdiction.NON_ALLIED,
      hasExportLicense: false,
    });

    expect(result.ok).toBe(false);
  });
});
