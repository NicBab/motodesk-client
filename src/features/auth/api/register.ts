import { apiRequest } from "@/lib/api/api-client";

//************************************************************** */

import type {
  AuthSession,
  RegisterInput,
} from "../auth.types";

//************************************************************** */

export function registerAccount(
  input: RegisterInput,
): Promise<AuthSession> {
  return apiRequest<AuthSession>("/auth/register", {
    method: "POST",
    body: input,
  });
}

//************************************************************** */