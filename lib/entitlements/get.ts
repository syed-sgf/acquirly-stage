import { ENTITLEMENTS_BY_PLAN } from "./rules";
import { Plan } from "./types";

// Pilot users get full access regardless of plan
const PILOT_EMAILS = [
  "syed@startinggatefinancial.com",
  // Add other pilot testers here
];

export function getEntitlements(plan?: Plan, email?: string) {
  // Pilot users get enterprise-level access
  if (email && PILOT_EMAILS.includes(email.toLowerCase())) {
    return ENTITLEMENTS_BY_PLAN["enterprise"];
  }
  
  return ENTITLEMENTS_BY_PLAN[plan ?? "free"];
}