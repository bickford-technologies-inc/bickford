export type AlertKind =
  | "SLO_BREACH"
  | "ROLLBACK"
  | "DEPLOY_FAIL"
  | "CANARY_HALT"
  | "SECURITY";

export type AlertEvent = {
  ts: string;
  tenantId: string;
  kind: AlertKind;
  severity?: string;
  title: string;
  message: string;
  details?: Record<string, unknown>;
};
