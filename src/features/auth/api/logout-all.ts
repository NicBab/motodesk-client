//************************************************************** */

import { apiRequest } from "@/lib/api/api-client";

//************************************************************** */

export type LogoutAllResult = {
  revokedSessionCount: number;
};

//************************************************************** */

export function logoutAll(): Promise<LogoutAllResult> {
  return apiRequest<LogoutAllResult>("/auth/logout-all", {
    method: "POST",
    body: {},
  });
}

//************************************************************** */