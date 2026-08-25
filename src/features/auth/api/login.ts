import { apiRequest } from "@/lib/api/api-client";

//************************************************************** */

import type {
  AuthSession,
  LoginInput,
} from "../auth.types";

//************************************************************** */

export function login(
  input: LoginInput,
): Promise<AuthSession> {
  return apiRequest<AuthSession>("/auth/login", {
    method: "POST",
    body: input,
  });
}

//************************************************************** */