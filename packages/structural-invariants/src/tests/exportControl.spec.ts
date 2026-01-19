import {
  EXPORT_CONTROL_INVARIANT,
  ControlClassification,
  Jurisdiction,
} from "@bickford/canon";

function assert(ok: boolean, message: string) {
  if (!ok) {
    throw new Error(message);
  }
}

/**
 * EXPORT CONTROL INVARIANT — STRUCTURAL TEST
 * Fails build on violation
 */

// Case 1: ITAR without license must fail
{
  const result = EXPORT_CONTROL_INVARIANT.assert({
    classification: ControlClassification.ITAR,
    origin: Jurisdiction.US,
    destination: Jurisdiction.NATO,
    hasExportLicense: false,
  });

  assert(result.ok === false, "ITAR export without license must be denied");
}

// Case 2: ITAR with license to allied nation must pass
{
  const result = EXPORT_CONTROL_INVARIANT.assert({
    classification: ControlClassification.ITAR,
    origin: Jurisdiction.US,
    destination: Jurisdiction.NATO,
    hasExportLicense: true,
    licenseId: "DL-ITAR-001",
  });

  assert(result.ok === true, "ITAR export with valid license must be allowed");
}

// Case 3: EAR-controlled export to non-allied nation must fail
{
  const result = EXPORT_CONTROL_INVARIANT.assert({
    classification: ControlClassification.EAR_CONTROLLED,
    origin: Jurisdiction.US,
    destination: Jurisdiction.NON_ALLIED,
    hasExportLicense: false,
  });

  assert(
    result.ok === false,
    "EAR-controlled export to non-allied jurisdiction must be denied",
  );
}
