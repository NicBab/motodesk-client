//************************************************************** */

import {
  apiRequest,
} from "@/lib/api/api-client";

import type {
  AuthSession,
} from "@/features/auth/auth.types";

//************************************************************** */

export type RegisterInvitedUserInput = {
  firstName: string;

  lastName: string;

  email: string;

  password: string;
};

//************************************************************** */

export function registerInvitedUser(
  input: RegisterInvitedUserInput,
): Promise<AuthSession> {
  /*
   * The backend registration contract allows organization
   * to be omitted. This creates only the User + auth session.
   *
   * The invitation acceptance creates the Membership afterward.
   */
  return apiRequest<AuthSession>(
    "/auth/register",
    {
      method:
        "POST",

      body:
        input,
    },
  );
}

//************************************************************** */