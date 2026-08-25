import { apiRequest } from "@/lib/api/api-client";

import type { AuthSession } from "../auth.types";

//************************************************************** */

export function getCurrentUser(): Promise<AuthSession> {
  return apiRequest<AuthSession>("/auth/me", {
    method: "GET",
  });
}

//************************************************************** */