//************************************************************** */

import {
  apiRequest,
} from "@/lib/api/api-client";

import type {
  AuthenticatedMembership,
} from "@/features/auth/auth.types";

//************************************************************** */

export type AcceptedInvitationMembership =
  AuthenticatedMembership;

//************************************************************** */

export function acceptMembershipInvitation(
  token: string,
): Promise<AcceptedInvitationMembership> {
  return apiRequest<AcceptedInvitationMembership>(
    "/auth/accept-membership-invitation",
    {
      method:
        "POST",

      body: {
        token,
      },
    },
  );
}

//************************************************************** */