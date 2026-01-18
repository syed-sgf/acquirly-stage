import { ENTITLEMENTS_BY_PLAN } from "./rules";
import { Plan } from "./types";

export function getEntitlements(plan?: Plan) {
  return ENTITLEMENTS_BY_PLAN[plan ?? "free"];
}
