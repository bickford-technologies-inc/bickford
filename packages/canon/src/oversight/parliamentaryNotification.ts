export interface ParliamentaryNotificationProtocol {
  events: {
    eventType:
      | "EXECUTIVE_OVERRIDE"
      | "TREATY_REVIEW"
      | "ESCALATION"
      | "WARTIME_ACTIVATION";
    notificationDelayMs: number; // 0 for immediate
    classificationType:
      | "UNCLASSIFIED"
      | "CLASSIFIED_SUMMARY"
      | "FULL_CLASSIFIED";
  }[];
  mandatoryDisclosure: {
    within24Hours: string[];
    weeklyReport: string[];
    monthlyReport: string[];
  };
}
